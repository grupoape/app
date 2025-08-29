class ImageEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.placeholder = document.getElementById('placeholder');
        
        // Only proceed if canvas exists
        if (!this.canvas || !this.ctx) {
            console.error('Canvas or context not found');
            return;
        }
        
        // Frame images mapping - updated to include birthday frames and fundadora options
        this.frameImages = {
            fundadora1: 'https://i.ibb.co/W4h35QBp/Post-Instagram-Dia-das-Crian-as-Imagina-o-Foto-2.png',
            fundadora2: 'https://i.ibb.co/4RXcYGV6/A-FUNDADORA.png',
            lider: 'https://i.ibb.co/JR9zMXvv/l-DER.png',
            diretor: 'https://i.ibb.co/JR9zMXvv/l-DER.png', // Using lider as placeholder for diretor
            marketing: 'https://i.ibb.co/HDKkq5Zp/marketing.png',
            membro: 'https://i.ibb.co/MxtG856D/MEMBRO.png',
            niver1: 'https://i.ibb.co/ksBSwdS4/NIVER.webp',
            niver2: 'https://i.ibb.co/pvNgQ6fW/NIVER2.jpg',
            niver3: 'https://i.ibb.co/4wqxkYJL/NIVER3.png',
            niver4: 'https://i.ibb.co/MyDZ0RWX/NIVER4.jpg'
        };
        
        this.currentFrameType = null;
        this.userImage = null;
        this.frameImage = new Image();
        this.frameImage.crossOrigin = 'anonymous';
        
        this.settings = {
            scale: 1,
            x: 0,
            y: 0,
            rotation: 0
        };
        
        this.canvasSize = 600;
        this.circleRadius = 200;
        this.circleCenter = { x: 300, y: 300 };
        
        // Dragging variables
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.imageStart = { x: 0, y: 0 };
        
        // Resize variables
        this.isResizing = false;
        this.resizeHandle = null;
        
        this.initControls();
        this.setupEventListeners();
        this.setupCanvasEvents();
        this.createResizeHandles();
        this.setupMenuNavigation();
    }
    
    setupMenuNavigation() {
        const menuContainer = document.getElementById('mainMenu');
        const editorContainer = document.getElementById('editorContainer');
        const backBtn = document.getElementById('backBtn');
        
        // Remove size limits for image scaling
        this.sizeSlider.min = 0;
        this.sizeSlider.max = 500;
        
        // Menu option handlers
        document.querySelectorAll('.menu-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                if (type === 'fundadora') {
                    // Show fundadora selection modal
                    this.showFundadoraSelection();
                } else if (type) {
                    this.selectFrameType(type);
                    
                    // Hide menu and show editor
                    menuContainer.style.display = 'none';
                    editorContainer.style.display = 'grid';
                }
            });
        });
        
        // Download APK button handler
        document.getElementById('downloadApkBtn').addEventListener('click', () => {
            window.open('https://drive.usercontent.google.com/download?id=1qXSyxDkMhzCjrxwAtl9-qYxf_gCYJhrA&export=download&authuser=0', '_blank');
        });
        
        // Back button handler
        backBtn.addEventListener('click', () => {
            // Show menu and hide editor
            menuContainer.style.display = 'block';
            editorContainer.style.display = 'none';
            
            // Reset editor state
            this.resetSettings();
        });
    }

    showFundadoraSelection() {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'fundadora-modal-overlay';
        overlay.innerHTML = `
            <div class="fundadora-modal">
                <h3>Escolha a imagem da Fundadora:</h3>
                <div class="fundadora-options">
                    <div class="fundadora-option" data-type="fundadora1">
                        <img src="${this.frameImages.fundadora1}" alt="Fundadora 1">
                        <span>Opção 1</span>
                    </div>
                    <div class="fundadora-option" data-type="fundadora2">
                        <img src="${this.frameImages.fundadora2}" alt="Fundadora 2">
                        <span>Opção 2</span>
                    </div>
                </div>
                <button class="close-modal-btn">Cancelar</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add event listeners
        overlay.querySelectorAll('.fundadora-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.selectFrameType(type);
                
                document.getElementById('mainMenu').style.display = 'none';
                document.getElementById('editorContainer').style.display = 'grid';
                
                overlay.remove();
            });
        });
        
        overlay.querySelector('.close-modal-btn').addEventListener('click', () => {
            overlay.remove();
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }
    
    initControls() {
        this.sizeSlider = document.getElementById('sizeSlider');
        this.xSlider = document.getElementById('xSlider');
        this.ySlider = document.getElementById('ySlider');
        this.rotationSlider = document.getElementById('rotationSlider');
        this.sizeValue = document.getElementById('sizeValue');
        this.xValue = document.getElementById('xValue');
        this.yValue = document.getElementById('yValue');
        this.rotationValue = document.getElementById('rotationValue');
        this.sizeInput = document.getElementById('sizeInput');
        
        // Create fundadora switch button
        this.createFundadoraSwitchButton();
        
        // Update size slider range to allow unlimited scaling
        this.sizeSlider.min = 0;
        this.sizeSlider.max = 1000; // Increased from 200 to 1000 for unlimited scaling
    }

    createFundadoraSwitchButton() {
        // Create switch button container
        const switchContainer = document.createElement('div');
        switchContainer.className = 'fundadora-switch-container';
        switchContainer.style.cssText = `
            position: absolute;
            top: 80px;
            right: 30px;
            z-index: 100;
            display: none;
        `;

        // Create switch button
        const switchButton = document.createElement('button');
        switchButton.className = 'fundadora-switch-btn';
        switchButton.textContent = 'Trocar Modelo';
        switchButton.style.cssText = `
            background: linear-gradient(135deg, var(--secondary-purple) 0%, var(--accent-purple) 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 20px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9rem;
            box-shadow: 0 5px 15px rgba(168, 85, 247, 0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        // Add icon
        const icon = document.createElement('span');
        icon.textContent = '↻';
        icon.style.fontSize = '1.1rem';
        switchButton.prepend(icon);

        // Create dropdown menu
        const dropdown = document.createElement('div');
        dropdown.className = 'fundadora-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 10px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 250, 0.2);
            border-radius: 15px;
            padding: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            display: none;
            min-width: 200px;
        `;

        // Create option buttons
        const option1 = document.createElement('button');
        option1.className = 'fundadora-option-btn';
        option1.textContent = 'Modelo 1';
        option1.style.cssText = `
            width: 100%;
            padding: 10px;
            margin-bottom: 8px;
            background: rgba(139, 92, 246, 0.2);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        `;

        const option2 = document.createElement('button');
        option2.className = 'fundadora-option-btn';
        option2.textContent = 'Modelo 2';
        option2.style.cssText = `
            width: 100%;
            padding: 10px;
            background: rgba(139, 92, 246, 0.2);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        `;

        // Add event listeners
        switchButton.addEventListener('click', () => {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });

        option1.addEventListener('click', () => {
            this.selectFrameType('fundadora1');
            dropdown.style.display = 'none';
            this.highlightActiveOption(option1, option2);
        });

        option2.addEventListener('click', () => {
            this.selectFrameType('fundadora2');
            dropdown.style.display = 'none';
            this.highlightActiveOption(option2, option1);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!switchContainer.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

        // Add hover effects
        [option1, option2].forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(168, 85, 247, 0.4)';
                btn.style.transform = 'translateY(-2px)';
            });
            btn.addEventListener('mouseleave', () => {
                const isActive = btn.style.background === 'rgba(168, 85, 247, 0.5)';
                btn.style.background = isActive ? 'rgba(168, 85, 247, 0.5)' : 'rgba(139, 92, 246, 0.2)';
                btn.style.transform = 'translateY(0)';
            });
        });

        // Highlight active option
        this.highlightActiveOption = (active, inactive) => {
            active.style.background = 'rgba(168, 85, 247, 0.5)';
            inactive.style.background = 'rgba(139, 92, 246, 0.2)';
        };

        // Set initial active state based on current frame
        if (this.currentFrameType === 'fundadora2') {
            this.highlightActiveOption(option2, option1);
        } else {
            this.highlightActiveOption(option1, option2);
        }

        // Assemble the components
        dropdown.appendChild(option1);
        dropdown.appendChild(option2);
        switchContainer.appendChild(switchButton);
        switchContainer.appendChild(dropdown);
        
        // Add to editor container
        const editorContainer = document.getElementById('editorContainer');
        editorContainer.style.position = 'relative';
        editorContainer.appendChild(switchContainer);

        // Store reference for show/hide
        this.fundadoraSwitchContainer = switchContainer;
    }

    selectFrameType(type) {
        this.currentFrameType = type;
        
        // Only proceed if frameImages has the type
        if (!this.frameImages[type]) {
            console.error('Frame type not found:', type);
            return;
        }
        
        this.frameImage = new Image();
        this.frameImage.crossOrigin = 'anonymous';
        this.frameImage.src = this.frameImages[type];
        
        // Show/hide fundadora switch button
        if (this.fundadoraSwitchContainer) {
            this.fundadoraSwitchContainer.style.display = 
                type === 'fundadora1' || type === 'fundadora2' ? 'block' : 'none';
        }
        
        this.frameImage.onload = () => {
            if (this.canvas && this.ctx) {
                this.setupCanvas();
                this.render();
                if (this.placeholder) {
                    this.placeholder.classList.add('hidden');
                }
                const downloadBtn = document.getElementById('downloadBtn');
                if (downloadBtn) downloadBtn.disabled = false;
            }
        };
        
        this.frameImage.onerror = () => {
            console.error('Failed to load frame image:', type);
        };
    }
    
    createResizeHandles() {
        this.imageControls = document.createElement('div');
        this.imageControls.className = 'image-controls';
        this.imageControls.style.display = 'none';
        
        const controlBox = document.createElement('div');
        controlBox.className = 'control-box';
        
        const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${position}`;
            handle.dataset.position = position;
            this.imageControls.appendChild(handle);
        });
        
        this.imageControls.appendChild(controlBox);
        this.canvas.parentElement.appendChild(this.imageControls);
        
        // Add resize handle events
        this.imageControls.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('resize-handle')) {
                e.preventDefault();
                this.startResize(e);
            }
        });
    }
    
    startResize(e) {
        if (!this.userImage) return;
        
        this.isResizing = true;
        this.resizeHandle = e.target.dataset.position;
        
        const rect = this.canvas.getBoundingClientRect();
        if (!rect) return;
        
        this.resizeStart = {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
        
        this.initialScale = this.settings.scale;
        
        // Store bound listeners for proper removal
        this.resizeMoveListener = this.handleResize.bind(this);
        this.resizeEndListener = this.stopResize.bind(this);
        
        document.addEventListener('mousemove', this.resizeMoveListener);
        document.addEventListener('mouseup', this.resizeEndListener);
    }
    
    handleResize(e) {
        if (!this.isResizing || !this.userImage || !this.canvas || !this.ctx) return;
        
        try {
            const rect = this.canvas.getBoundingClientRect();
            if (!rect) return;
            
            const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            
            // Add null checks for resizeStart and initialScale
            if (!this.resizeStart || typeof this.initialScale === 'undefined' || this.initialScale === null) {
                return;
            }
            
            const deltaX = mouseX - this.resizeStart.x;
            const deltaY = mouseY - this.resizeStart.y;
            
            // Calculate new scale based on handle position
            let scaleFactor = 1;
            const diagonal = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            switch (this.resizeHandle) {
                case 'bottom-right':
                    scaleFactor = 1 + (diagonal / 200);
                    break;
                case 'top-left':
                    scaleFactor = 1 - (diagonal / 200);
                    break;
                case 'top-right':
                    scaleFactor = 1 + (deltaX - deltaY) / 200;
                    break;
                case 'bottom-left':
                    scaleFactor = 1 + (-deltaX + deltaY) / 200;
                    break;
            }
            
            // Remove upper limit for unlimited scaling
            const newScale = Math.max(0.2, this.initialScale * scaleFactor);
            this.settings.scale = newScale;
            
            // Update slider - allow values beyond 1000%
            if (this.sizeSlider) {
                this.sizeSlider.value = Math.round(newScale * 100);
            }
            if (this.sizeValue) {
                this.sizeValue.textContent = Math.round(newScale * 100) + '%';
            }
            
            this.render();
        } catch (error) {
            console.error('Error in handleResize:', error);
        }
    }
    
    stopResize() {
        this.isResizing = false;
        this.resizeHandle = null;
        
        // Only clear these if they exist
        if (this.resizeStart) {
            this.resizeStart = null;
        }
        if (typeof this.initialScale !== 'undefined') {
            this.initialScale = null;
        }
        
        // Check if listeners exist before removing
        if (this.resizeMoveListener) {
            document.removeEventListener('mousemove', this.resizeMoveListener);
            this.resizeMoveListener = null;
        }
        if (this.resizeEndListener) {
            document.removeEventListener('mouseup', this.resizeEndListener);
            this.resizeEndListener = null;
        }
    }
    
    updateResizeHandles() {
        if (!this.userImage) {
            this.imageControls.style.display = 'none';
            return;
        }
        
        const scale = this.settings.scale;
        const scaledWidth = this.userImage.width * scale;
        const scaledHeight = this.userImage.height * scale;
        
        const offsetX = (this.settings.x / 100) * this.circleRadius;
        const offsetY = (this.settings.y / 100) * this.circleRadius;
        
        const centerX = this.circleCenter.x + offsetX;
        const centerY = this.circleCenter.y + offsetY;
        
        const halfWidth = scaledWidth / 2;
        const halfHeight = scaledHeight / 2;
        
        // Update control box position and size
        const controlBox = this.imageControls.querySelector('.control-box');
        controlBox.style.left = (centerX - halfWidth) + 'px';
        controlBox.style.top = (centerY - halfHeight) + 'px';
        controlBox.style.width = scaledWidth + 'px';
        controlBox.style.height = scaledHeight + 'px';
        
        // Update handle positions
        const handles = this.imageControls.querySelectorAll('.resize-handle');
        handles.forEach(handle => {
            const position = handle.dataset.position;
            let left, top;
            
            switch (position) {
                case 'top-left':
                    left = centerX - halfWidth - 10;
                    top = centerY - halfHeight - 10;
                    break;
                case 'top-right':
                    left = centerX + halfWidth - 10;
                    top = centerY - halfHeight - 10;
                    break;
                case 'bottom-left':
                    left = centerX - halfWidth - 10;
                    top = centerY + halfHeight - 10;
                    break;
                case 'bottom-right':
                    left = centerX + halfWidth - 10;
                    top = centerY + halfHeight - 10;
                    break;
            }
            
            handle.style.left = left + 'px';
            handle.style.top = top + 'px';
        });
        
        this.imageControls.style.display = 'block';
        this.imageControls.classList.add('active');
    }
    
    setupEventListeners() {
        document.getElementById('imageUpload').addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSettings());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadImage());
        
        this.sizeSlider.addEventListener('input', (e) => {
            this.settings.scale = e.target.value / 100;
            this.sizeInput.value = e.target.value;
            this.render();
        });
        
        this.sizeInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value);
            if (isNaN(value)) value = 100;
            // Remove upper limit for unlimited scaling
            value = Math.max(0, value);
            
            this.settings.scale = value / 100;
            this.sizeSlider.value = value;
            e.target.value = value;
            this.render();
        });
        
        this.xSlider.addEventListener('input', (e) => {
            this.settings.x = parseInt(e.target.value);
            this.xValue.textContent = e.target.value;
            this.render();
        });
        
        this.ySlider.addEventListener('input', (e) => {
            this.settings.y = parseInt(e.target.value);
            this.yValue.textContent = e.target.value;
            this.render();
        });
        
        this.rotationSlider.addEventListener('input', (e) => {
            this.settings.rotation = e.target.value * Math.PI / 180;
            this.rotationValue.textContent = e.target.value + '°';
            this.render();
        });
    }
    
    setupCanvasEvents() {
        if (!this.canvas) return;
        
        let rect = this.canvas.getBoundingClientRect();
        
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (!this.userImage) return;
            
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newScale = Math.max(0.5, Math.min(2.0, this.settings.scale + delta));
            
            this.settings.scale = newScale;
            if (this.sizeSlider) {
                this.sizeSlider.value = Math.round(newScale * 100);
            }
            if (this.sizeValue) {
                this.sizeValue.textContent = Math.round(newScale * 100) + '%';
            }
            
            this.render();
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.userImage || !this.canvas) return;
            
            const rect = this.canvas.getBoundingClientRect();
            if (!rect) return;
            
            const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            
            if (this.isPointInCircle(mouseX, mouseY)) {
                this.isDragging = true;
                this.dragStart = { x: mouseX, y: mouseY };
                this.imageStart = { x: this.settings.x, y: this.settings.y };
                this.canvas.style.cursor = 'grabbing';
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging || !this.canvas) return;
            
            const rect = this.canvas.getBoundingClientRect();
            if (!rect) return;
            
            const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            
            const deltaX = mouseX - this.dragStart.x;
            const deltaY = mouseY - this.dragStart.y;
            
            this.settings.x = this.imageStart.x + (deltaX / this.circleRadius) * 100;
            this.settings.y = this.imageStart.y + (deltaY / this.circleRadius) * 100;
            
            // Update sliders with null checks
            if (this.xSlider) {
                this.xSlider.value = Math.max(-100, Math.min(100, Math.round(this.settings.x)));
            }
            if (this.xValue) {
                this.xValue.textContent = Math.round(this.settings.x);
            }
            if (this.ySlider) {
                this.ySlider.value = Math.max(-100, Math.min(100, Math.round(this.settings.y)));
            }
            if (this.yValue) {
                this.yValue.textContent = Math.round(this.settings.y);
            }
            
            this.render();
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            if (this.canvas) {
                this.canvas.style.cursor = 'grab';
            }
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            if (this.canvas) {
                this.canvas.style.cursor = 'default';
            }
        });
        
        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            rect = this.canvas.getBoundingClientRect();
        });
    }
    
    isPointInCircle(x, y) {
        const distance = Math.sqrt(
            Math.pow(x - this.circleCenter.x, 2) + 
            Math.pow(y - this.circleCenter.y, 2)
        );
        return distance <= this.circleRadius;
    }
    
    setupCanvas() {
        if (!this.canvas) return;
        this.canvas.width = this.canvasSize;
        this.canvas.height = this.canvasSize;
    }
    
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.userImage = this.createCircularImage(img);
                
                // Check frame type and apply specific settings
                let scale = 1;
                let yPos = 0;
                let xPos = 0;
                
                if (this.currentFrameType === 'niver2') {
                    scale = 0.09; // 9%
                    yPos = -6;    // Y -6
                    xPos = 0;
                } else if (this.currentFrameType === 'niver3') {
                    scale = 0.08; // 8%
                    yPos = -8;    // Y -8
                    xPos = 0;
                } else if (this.currentFrameType === 'niver4') {
                    scale = 0.09; // 9%
                    yPos = -38;   // Y -38
                    xPos = 0;
                } else if (this.currentFrameType === 'niver1') {
                    // Default birthday frames settings
                    scale = 0.07;
                    yPos = -8;
                    xPos = 0;
                } else {
                    // Default regular frames settings
                    scale = 0.1;
                    yPos = 0;
                    xPos = 0;
                }
                
                this.settings.scale = scale;
                this.settings.y = yPos;
                this.settings.x = xPos;
                
                // Update sliders
                if (this.sizeSlider) this.sizeSlider.value = Math.round(scale * 100);
                if (this.sizeInput) this.sizeInput.value = Math.round(scale * 100);
                if (this.ySlider) this.ySlider.value = yPos;
                if (this.xSlider) this.xSlider.value = xPos;
                
                // Update display values
                if (this.sizeValue) this.sizeValue.textContent = Math.round(scale * 100) + '%';
                if (this.yValue) this.yValue.textContent = yPos;
                if (this.xValue) this.xValue.textContent = xPos;
                
                this.render();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    createCircularImage(img) {
        // Create a temporary canvas to create circular image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Use a much larger canvas to ensure full coverage
        const size = Math.max(img.width, img.height) * 2;
        tempCanvas.width = size;
        tempCanvas.height = size;
        
        // Fill entire canvas with image, scaled to cover circle
        const scale = Math.max(size / img.width, size / img.height) * 1.5; // Increase scale to ensure full coverage
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (size - scaledWidth) / 2;
        const offsetY = (size - scaledHeight) / 2;
        
        // Create circular clip with full radius
        tempCtx.save();
        tempCtx.beginPath();
        tempCtx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2); // Slightly smaller radius to prevent edge artifacts
        tempCtx.clip();
        
        // Draw image centered and scaled to fill circle
        tempCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        tempCtx.restore();
        
        // Create new image from canvas
        const circularImg = new Image();
        circularImg.src = tempCanvas.toDataURL();
        
        return circularImg;
    }
    
    createCircularMask() {
        this.ctx.globalCompositeOperation = 'destination-in';
        this.ctx.beginPath();
        this.ctx.arc(this.circleCenter.x, this.circleCenter.y, this.circleRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    render() {
        if (!this.canvas || !this.ctx) return;
        
        try {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Ensure frame image is loaded before drawing
            if (this.frameImage && this.frameImage.complete && this.frameImage.naturalHeight > 0) {
                this.ctx.drawImage(this.frameImage, 0, 0, this.canvas.width, this.canvas.height);
            }
            
            if (this.userImage && this.userImage.complete && this.userImage.naturalHeight > 0) {
                this.ctx.save();
                
                this.ctx.beginPath();
                this.ctx.arc(this.circleCenter.x, this.circleCenter.y, this.circleRadius, 0, Math.PI * 2);
                this.ctx.clip();
                
                const scaledWidth = this.userImage.width * this.settings.scale;
                const scaledHeight = this.userImage.height * this.settings.scale;
                
                const offsetX = (this.settings.x / 100) * this.circleRadius;
                const offsetY = (this.settings.y / 100) * this.circleRadius;
                
                const centerX = this.circleCenter.x - scaledWidth / 2 + offsetX;
                const centerY = this.circleCenter.y - scaledHeight / 2 + offsetY;
                
                this.ctx.translate(this.circleCenter.x + offsetX, this.circleCenter.y + offsetY);
                this.ctx.rotate(this.settings.rotation);
                this.ctx.translate(-(this.circleCenter.x + offsetX), -(this.circleCenter.y + offsetY));
                
                this.ctx.drawImage(
                    this.userImage,
                    centerX,
                    centerY,
                    scaledWidth,
                    scaledHeight
                );
                
                this.ctx.restore();
            }
            
            // Ensure placeholder is hidden when we have images
            if (this.userImage && this.placeholder) {
                this.placeholder.classList.add('hidden');
            }
            
            this.updateResizeHandles();
        } catch (error) {
            console.error('Error in render:', error);
        }
    }
    
    resetSettings() {
        // Clear canvas first - with null checks
        if (this.canvas && this.ctx) {
            try {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            } catch (error) {
                console.error('Error clearing canvas:', error);
            }
        }
        
        // Reset user image
        this.userImage = null;
        
        // Reset settings
        this.settings = {
            scale: 1,
            x: 0,
            y: 0,
            rotation: 0
        };
        
        // Reset UI - add null checks
        if (this.sizeSlider) this.sizeSlider.value = 100;
        if (this.sizeInput) this.sizeInput.value = 100;
        if (this.xSlider) this.xSlider.value = 0;
        if (this.ySlider) this.ySlider.value = 0;
        if (this.rotationSlider) this.rotationSlider.value = 0;
        
        // Update display values with null checks
        if (this.xValue) this.xValue.textContent = '0';
        if (this.yValue) this.yValue.textContent = '0';
        if (this.rotationValue) this.rotationValue.textContent = '0°';
        
        // Force reload frame image if type is set
        if (this.currentFrameType) {
            this.selectFrameType(this.currentFrameType);
        }
        
        // Show placeholder and disable download - null check for placeholder
        if (this.placeholder) {
            this.placeholder.classList.remove('hidden');
        }
        
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) downloadBtn.disabled = true;
        
        // Clear file input - null check
        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) imageUpload.value = '';
        
        // Hide resize handles - null check
        if (this.imageControls) {
            this.imageControls.style.display = 'none';
        }
    }
    
    downloadImage() {
        if (!this.canvas) return;
        
        const link = document.createElement('a');
        link.download = `imagem-${this.currentFrameType || 'personalizada'}.png`;
        link.href = this.canvas.toDataURL('image/png', 1.0);
        link.click();
    }
}

class BirthdayManager {
    constructor() {
        this.birthdays = this.loadBirthdays();
        this.initBirthdayEvents();
        this.loadPreDefinedBirthdays();
    }

    loadPreDefinedBirthdays() {
        const preDefinedBirthdays = [
            // Janeiro
            { name: "APE_PATRICIA2022", date: "2024-01-02", day: 2, month: 1 },
            { name: "APE_Mylla_Johny", date: "2024-01-02", day: 2, month: 1 },
            { name: "APE_ANYPerez", date: "2024-01-03", day: 3, month: 1 },
            { name: "APE_ADM_Sonia", date: "2024-01-04", day: 4, month: 1 },
            { name: "APE_NathsRocha", date: "2024-01-06", day: 6, month: 1 },
            { name: "APE_Lanneh3.", date: "2024-01-07", day: 7, month: 1 },
            { name: "APE_Angelica1", date: "2024-01-08", day: 8, month: 1 },
            { name: "APE_Miria Britto", date: "2024-01-11", day: 11, month: 1 },
            { name: "APE_LeoSilva", date: "2024-01-16", day: 16, month: 1 },
            { name: "APE_PAULINHO", date: "2024-01-17", day: 17, month: 1 },
            { name: "APE_Pr_j_Arantes", date: "2024-01-18", day: 18, month: 1 },
            { name: "APE_ITAMARA", date: "2024-01-20", day: 20, month: 1 },
            { name: "APE_Ana_Leticia", date: "2024-01-22", day: 22, month: 1 },
            { name: "APE_SHILEYSOUZA", date: "2024-01-23", day: 23, month: 1 },
            { name: "APE_ADRIANA", date: "2024-01-24", day: 24, month: 1 },
            { name: "APE_IDALICE", date: "2024-01-25", day: 25, month: 1 },
            { name: "APE_Laradri", date: "2024-01-26", day: 26, month: 1 },
            { name: "APE_LEYA Tavares", date: "2024-01-27", day: 27, month: 1 },
            { name: "APE_MATILDE", date: "2024-01-27", day: 27, month: 1 },
            { name: "APE_SILVIASANTOS", date: "2024-01-28", day: 28, month: 1 },
            { name: "APE_anderson_777-", date: "2024-01-28", day: 28, month: 1 },

            // Fevereiro
            { name: "APE_PAULA", date: "2024-02-02", day: 2, month: 2 },
            { name: "APE_franciscoj", date: "2024-02-03", day: 3, month: 2 },
            { name: "APE_Anninha", date: "2024-02-03", day: 3, month: 2 },
            { name: "APE_TATIANE", date: "2024-02-05", day: 5, month: 2 },
            { name: "APE_LIDER_Leiah", date: "2024-02-06", day: 6, month: 2 },
            { name: "APE_Irani", date: "2024-02-06", day: 6, month: 2 },
            { name: "APE_JOAOLINS", date: "2024-02-09", day: 9, month: 2 },
            { name: "APE_BarbaraSouza", date: "2024-02-16", day: 16, month: 2 },
            { name: "APE_LIDER Sandra", date: "2024-02-12", day: 12, month: 2 },
            { name: "APE_Sara", date: "2024-02-12", day: 12, month: 2 },
            { name: "APE_TINA", date: "2024-02-16", day: 16, month: 2 },
            { name: "APE_marilene", date: "2024-02-16", day: 16, month: 2 },
            { name: "APE_Jonatas", date: "2024-02-17", day: 17, month: 2 },
            { name: "APE_MARIA", date: "2024-02-19", day: 19, month: 2 },
            { name: "APE_JOEL01", date: "2024-02-19", day: 19, month: 2 },
            { name: "APE_fernando", date: "2024-02-20", day: 20, month: 2 },
            { name: "APE_Moninha", date: "2024-02-26", day: 26, month: 2 },
            { name: "APE_ROSANGELA (Melo)", date: "2024-02-28", day: 28, month: 2 },

            // Março
            { name: "APE_RoseBastos", date: "2024-03-06", day: 6, month: 3 },
            { name: "APE_Dih Brito", date: "2024-03-07", day: 7, month: 3 },
            { name: "APE_Tathi", date: "2024-03-07", day: 7, month: 3 },
            { name: "APE_Calila", date: "2024-03-09", day: 9, month: 3 },
            { name: "APE_SandraRamos", date: "2024-03-09", day: 9, month: 3 },
            { name: "APE_MARLENE", date: "2024-03-10", day: 10, month: 3 },
            { name: "APE_PR_ROBERTO", date: "2024-03-10", day: 10, month: 3 },
            { name: "APE_SilvaEny", date: "2024-03-11", day: 11, month: 3 },
            { name: "APE_LIVIA", date: "2024-03-12", day: 12, month: 3 },
            { name: "APE_Pastor_LENO", date: "2024-03-13", day: 13, month: 3 },
            { name: "APE_SAMUKA", date: "2024-03-14", day: 14, month: 3 },
            { name: "APE_LucivanGomes", date: "2024-03-15", day: 15, month: 3 },
            { name: "APE_GEIZA38", date: "2024-03-15", day: 15, month: 3 },
            { name: "APE_LIDER_JU", date: "2024-03-16", day: 16, month: 3 },
            { name: "APE_JoelRodrigues", date: "2024-03-17", day: 17, month: 3 },
            { name: "APE_elizleidmar", date: "2024-03-18", day: 18, month: 3 },
            { name: "APE_MIGUELalves", date: "2024-03-20", day: 20, month: 3 },
            { name: "APE_SolangeA127-", date: "2024-03-20", day: 20, month: 3 },
            { name: "APE_Helena_Ka", date: "2024-03-20", day: 20, month: 3 },
            { name: "APE_Soares", date: "2024-03-21", day: 21, month: 3 },
            { name: "APE_Moises", date: "2024-03-22", day: 22, month: 3 },
            { name: "APE_DurciSerra", date: "2024-03-25", day: 25, month: 3 },
            { name: "APE_Dinajulio", date: "2024-03-26", day: 26, month: 3 },
            { name: "APE_JonasCanutto", date: "2024-03-27", day: 27, month: 3 },
            { name: "APE_Isabel", date: "2024-03-28", day: 28, month: 3 },
            { name: "APE_RayanePamela", date: "2024-03-29", day: 29, month: 3 },
            { name: "APE_ALDREY", date: "2024-03-30", day: 30, month: 3 },
            { name: "APE_ARMANDO", date: "2024-03-30", day: 30, month: 3 },

            // Abril
            { name: "APE_PATRICIAG", date: "2024-04-01", day: 1, month: 4 },
            { name: "APE_ROSANGELA (Tavares)", date: "2024-04-02", day: 2, month: 4 },
            { name: "APE_Polly", date: "2024-04-03", day: 3, month: 4 },
            { name: "APE_MonicaLopes", date: "2024-04-04", day: 4, month: 4 },
            { name: "APE_DeboraSilva", date: "2024-04-04", day: 4, month: 4 },
            { name: "APE_FatimaDourad", date: "2024-04-08", day: 8, month: 4 },
            { name: "APE_JHERE", date: "2024-04-08", day: 8, month: 4 },
            { name: "APE_Carlinhos", date: "2024-04-11", day: 11, month: 4 },
            { name: "APE_Romilda", date: "2024-04-14", day: 14, month: 4 },
            { name: "APE_MicheliSe", date: "2024-04-15", day: 15, month: 4 },
            { name: "APE_LeandroF", date: "2024-04-16", day: 16, month: 4 },
            { name: "APE_JUSSARA 704", date: "2024-04-20", day: 20, month: 4 },
            { name: "APE_ADM_elisson", date: "2024-04-21", day: 21, month: 4 },
            { name: "APE_IvoneSilva", date: "2024-04-21", day: 21, month: 4 },
            { name: "APE_Gabriele", date: "2024-04-21", day: 21, month: 4 },
            { name: "APE_MarcoAthayde", date: "2024-04-21", day: 21, month: 4 },
            { name: "APE_KATIELE", date: "2024-04-28", day: 28, month: 4 },
            { name: "APE_ArleteSand", date: "2024-04-29", day: 29, month: 4 },
            { name: "APE_SoniaSimoes", date: "2024-04-29", day: 29, month: 4 },

            // Maio
            { name: "APE_Elenilda", date: "2024-05-01", day: 1, month: 5 },
            { name: "APE_ElenildaAl", date: "2024-05-02", day: 2, month: 5 },
            { name: "APE_PrMarcia", date: "2024-05-04", day: 4, month: 5 },
            { name: "APE_Azevedo Santos (irmã)", date: "2024-05-05", day: 5, month: 5 },
            { name: "APE_JosianeO", date: "2024-05-05", day: 5, month: 5 },
            { name: "APE_MatosCCB", date: "2024-05-05", day: 5, month: 5 },
            { name: "APE_Leandro09", date: "2024-05-09", day: 9, month: 5 },
            { name: "APE_Denis Vittor", date: "2024-05-09", day: 9, month: 5 },
            { name: "APE_LEA", date: "2024-05-10", day: 10, month: 5 },
            { name: "APE_PATRICK", date: "2024-05-10", day: 10, month: 5 },
            { name: "APE_Rosi13", date: "2024-05-13", day: 13, month: 5 },
            { name: "APE_XAVIER", date: "2024-05-15", day: 15, month: 5 },
            { name: "APE_PrMartins61", date: "2024-05-17", day: 17, month: 5 },
            { name: "APE_CELIA", date: "2024-05-19", day: 19, month: 5 },
            { name: "APE_joilson2019", date: "2024-05-20", day: 20, month: 5 },
            { name: "APE_Safira_Alm", date: "2024-05-26", day: 26, month: 5 },
            { name: "APE_Dorkas", date: "2024-05-26", day: 26, month: 5 },
            { name: "APE_SEVERINO", date: "2024-05-27", day: 27, month: 5 },
            { name: "APE_Milziane", date: "2024-05-28", day: 28, month: 5 },

            // Junho
            { name: "APE_ALEXSOUZA123-", date: "2024-06-02", day: 2, month: 6 },
            { name: "APE_SaraRaquel", date: "2024-06-04", day: 4, month: 6 },
            { name: "APE_Milani", date: "2024-06-08", day: 8, month: 6 },
            { name: "APE_Deh_Patricio", date: "2024-06-09", day: 9, month: 6 },
            { name: "APE_Simone8", date: "2024-06-10", day: 10, month: 6 },
            { name: "APE_Cleusa", date: "2024-06-11", day: 11, month: 6 },
            { name: "APE_PEROLA", date: "2024-06-12", day: 12, month: 6 },
            { name: "APE_CECILIA", date: "2024-06-14", day: 14, month: 6 },
            { name: "APE_CirleneGui", date: "2024-06-14", day: 14, month: 6 },
            { name: "APE_Raquel204", date: "2024-06-18", day: 18, month: 6 },
            { name: "APE_Helena", date: "2024-06-20", day: 20, month: 6 },
            { name: "APE_FABIOH", date: "2024-06-21", day: 21, month: 6 },
            { name: "APE_Joselia", date: "2024-06-25", day: 25, month: 6 },
            { name: "APE_SERGIO", date: "2024-06-26", day: 26, month: 6 },
            { name: "APE_florisacout", date: "2024-06-26", day: 26, month: 6 },
            { name: "APE_AnaJulia", date: "2024-06-26", day: 26, month: 6 },
            { name: "APE_CHEREM", date: "2024-06-27", day: 27, month: 6 },
            { name: "APE_Mara", date: "2024-06-29", day: 29, month: 6 },

            // Julho
            { name: "APE_JoannaSilva", date: "2024-07-01", day: 1, month: 7 },
            { name: "APE_CLAUDIA", date: "2024-07-03", day: 3, month: 7 },
            { name: "APE_FunPrClarice", date: "2024-07-04", day: 4, month: 7 },
            { name: "APE_josepaulovs", date: "2024-07-06", day: 6, month: 7 },
            { name: "APE_MaryKilary", date: "2024-07-07", day: 7, month: 7 },
            { name: "APE_Abel", date: "2024-07-13", day: 13, month: 7 },
            { name: "APE_GeeLima", date: "2024-07-14", day: 14, month: 7 },
            { name: "APE_Iraquena15", date: "2024-07-15", day: 15, month: 7 },
            { name: "APE_CLARIZAN", date: "2024-07-17", day: 17, month: 7 },
            { name: "APE_ALCIR", date: "2024-07-21", day: 21, month: 7 },
            { name: "APE_LIDER_AMANDA", date: "2024-07-22", day: 22, month: 7 },
            { name: "APE_Vanessa", date: "2024-07-22", day: 22, month: 7 },
            { name: "APE_ALISSON", date: "2024-07-25", day: 25, month: 7 },
            { name: "APE_AssisVascon", date: "2024-07-26", day: 26, month: 7 },
            { name: "APE_RAFAELA12-", date: "2024-07-28", day: 28, month: 7 },
            { name: "APE_Carmem72", date: "2024-07-30", day: 30, month: 7 },

            // Agosto
            { name: "APE_Louvor_Vilma", date: "2024-08-05", day: 5, month: 8 },
            { name: "APE_DiReys10", date: "2024-08-06", day: 6, month: 8 },
            { name: "APE_Diniz", date: "2024-08-07", day: 7, month: 8 },
            { name: "APE_BISPOCunha", date: "2024-08-12", day: 12, month: 8 },
            { name: "APE_josyguapa", date: "2024-08-12", day: 12, month: 8 },
            { name: "APE_Liam_Cortbar", date: "2024-08-12", day: 12, month: 8 },
            { name: "APE_MISSDALILA", date: "2024-08-16", day: 16, month: 8 },
            { name: "APE_Anninha", date: "2024-08-17", day: 17, month: 8 },
            { name: "APE_ANA_MARIA", date: "2024-08-17", day: 17, month: 8 },
            { name: "APE_ELIANE42-", date: "2024-08-19", day: 19, month: 8 },
            { name: "APE_AnaluzRapozo", date: "2024-08-20", day: 20, month: 8 },
            { name: "APE_LUIZ", date: "2024-08-21", day: 21, month: 8 },
            { name: "APE_JOSIEL.", date: "2024-08-21", day: 21, month: 8 },
            { name: "APE_Beatriz", date: "2024-08-24", day: 24, month: 8 },
            { name: "APE_Lucineia", date: "2024-08-24", day: 24, month: 8 },
            { name: "APE_ITALIA", date: "2024-08-25", day: 25, month: 8 },
            { name: "APE_JoanaBrito", date: "2024-08-31", day: 31, month: 8 },

            // Setembro
            { name: "APE_GESAN", date: "2024-09-02", day: 2, month: 9 },
            { name: "APE_JoilanRosans", date: "2024-09-02", day: 2, month: 9 },
            { name: "APE_MIQUEIAS", date: "2024-09-04", day: 4, month: 9 },
            { name: "APE_MargarethB", date: "2024-09-04", day: 4, month: 9 },
            { name: "APE_CARMELINE", date: "2024-09-04", day: 4, month: 9 },
            { name: "APE_Lucy", date: "2024-09-05", day: 5, month: 9 },
            { name: "APE_CLAU25", date: "2024-09-05", day: 5, month: 9 },
            { name: "APE_SIMEIA", date: "2024-09-05", day: 5, month: 9 },
            { name: "APE_VanessaB156-", date: "2024-09-06", day: 6, month: 9 },
            { name: "APE_Cassiane", date: "2024-09-07", day: 7, month: 9 },
            { name: "APE_Onelia", date: "2024-09-10", day: 10, month: 9 },
            { name: "APE_pravanusa", date: "2024-09-10", day: 10, month: 9 },
            { name: "APE_TiagoAlmeida", date: "2024-09-12", day: 12, month: 9 },
            { name: "APE_Vilcania2025", date: "2024-09-12", day: 12, month: 9 },
            { name: "APE_Maria_Alves", date: "2024-09-13", day: 13, month: 9 },
            { name: "APE_LIDER_LI", date: "2024-09-14", day: 14, month: 9 },
            { name: "APE_Weltonbessa", date: "2024-09-18", day: 18, month: 9 },
            { name: "APE_AnaMaria", date: "2024-09-18", day: 18, month: 9 },
            { name: "APE_TioLindomar", date: "2024-09-22", day: 22, month: 9 },
            { name: "APE_MARDENIA", date: "2024-09-22", day: 22, month: 9 },
            { name: "APE_Marcia", date: "2024-09-23", day: 23, month: 9 },
            { name: "APE_RISOMAR", date: "2024-09-23", day: 23, month: 9 },
            { name: "APE_Josy", date: "2024-09-25", day: 25, month: 9 },
            { name: "APE_susucafe1", date: "2024-09-25", day: 25, month: 9 },
            { name: "APE_Walter", date: "2024-09-27", day: 27, month: 9 },
            { name: "APE_KeniaPaula", date: "2024-09-27", day: 27, month: 9 },
            { name: "APE_Ale", date: "2024-09-29", day: 29, month: 9 },

            // Outubro
            { name: "APE_Ester_Roque", date: "2024-10-01", day: 1, month: 10 },
            { name: "APE_FABI", date: "2024-10-03", day: 3, month: 10 },
            { name: "APE_Antonia", date: "2024-10-06", day: 6, month: 10 },
            { name: "APE_MILCHELGILDA", date: "2024-10-11", day: 11, month: 10 },
            { name: "APE_JaimeFonseca", date: "2024-10-11", day: 11, month: 10 },
            { name: "APE_PattyMiguel", date: "2024-10-25", day: 25, month: 10 },
            { name: "APE_AninhaMoraes", date: "2024-10-26", day: 26, month: 10 },
            { name: "APE_DANIEL (Faria)", date: "2024-10-29", day: 29, month: 10 },
            { name: "APE_Marcio", date: "2024-10-31", day: 31, month: 10 },

            // Novembro
            { name: "APE_LIDER_LAY", date: "2024-11-03", day: 3, month: 11 },
            { name: "APE_Filomena", date: "2024-11-04", day: 4, month: 11 },
            { name: "APE_Erick", date: "2024-11-05", day: 5, month: 11 },
            { name: "APE_Hilda", date: "2024-11-07", day: 7, month: 11 },
            { name: "APE_LILI MUSIC", date: "2024-11-09", day: 9, month: 11 },
            { name: "APE_tiago23-", date: "2024-11-10", day: 10, month: 11 },
            { name: "APE_Heryka", date: "2024-11-10", day: 10, month: 11 },
            { name: "APE_Nanna Ferry", date: "2024-11-14", day: 14, month: 11 },
            { name: "APE_IndiaGospel", date: "2024-11-14", day: 14, month: 11 },
            { name: "APE_Aline1986", date: "2024-11-19", day: 19, month: 11 },
            { name: "APE_JulieteBraz", date: "2024-11-20", day: 20, month: 11 },
            { name: "APE_DAN", date: "2024-11-22", day: 22, month: 11 },
            { name: "APE_Marcinha", date: "2024-11-22", day: 22, month: 11 },
            { name: "APE_EdaM_Maia", date: "2024-11-22", day: 22, month: 11 },
            { name: "APE_APE_Feeh", date: "2024-11-22", day: 22, month: 11 },
            { name: "APE_Guedes", date: "2024-11-22", day: 22, month: 11 },
            { name: "APE_Denilson", date: "2024-11-23", day: 23, month: 11 },
            { name: "APE_Nice2421", date: "2024-11-24", day: 24, month: 11 },
            { name: "APE_Pra_MCarmo", date: "2024-11-26", day: 26, month: 11 },
            { name: "APE_gospel2024 (Irmã Ladjane)", date: "2024-11-27", day: 27, month: 11 },
            { name: "APE_MariaAmelia", date: "2024-11-28", day: 28, month: 11 },
            { name: "APE_LIDER_Beth", date: "2024-11-28", day: 28, month: 11 },
            { name: "APE_Iran412", date: "2024-11-29", day: 29, month: 11 },
            { name: "APE_Neidinha", date: "2024-11-29", day: 29, month: 11 },
            { name: "APE_HellenTha", date: "2024-11-29", day: 29, month: 11 },
            { name: "APE_LIDER_MEIRE", date: "2024-11-30", day: 30, month: 11 },

            // Dezembro
            { name: "APE_DEUZIRENE68", date: "2024-12-01", day: 1, month: 12 },
            { name: "APE_Iris", date: "2024-12-05", day: 5, month: 12 },
            { name: "APE_Drika", date: "2024-12-09", day: 9, month: 12 },
            { name: "APE_Simare", date: "2024-12-09", day: 9, month: 12 },
            { name: "APE_Cleverson", date: "2024-12-10", day: 10, month: 12 },
            { name: "APE_PrCelso", date: "2024-12-11", day: 11, month: 12 },
            { name: "APE_ALINE2002", date: "2024-12-11", day: 11, month: 12 },
            { name: "APE_Jonas", date: "2024-12-11", day: 11, month: 12 },
            { name: "APE_APE_Lenilda", date: "2024-12-13", day: 13, month: 12 },
            { name: "APE_LIDER_mart", date: "2024-12-14", day: 14, month: 12 },
            { name: "APE_Vanny33", date: "2024-12-14", day: 14, month: 12 },
            { name: "APE_Lindamar", date: "2024-12-14", day: 14, month: 12 },
            { name: "APE_Priscila1", date: "2024-12-15", day: 15, month: 12 },
            { name: "APE_DirJOSIEL", date: "2024-12-17", day: 17, month: 12 },
            { name: "APE_Sônia_Silva", date: "2024-12-18", day: 18, month: 12 },
            { name: "APE_LIDER_Sati", date: "2024-12-18", day: 18, month: 12 },
            { name: "APE_JR_JOIARARA", date: "2024-12-19", day: 19, month: 12 },
            { name: "APE_HITALLO", date: "2024-12-20", day: 20, month: 12 },
            { name: "APE_Arlete", date: "2024-12-22", day: 22, month: 12 },
            { name: "APE_AdrianaSenra", date: "2024-12-25", day: 25, month: 12 },
            { name: "APE_Ricardo", date: "2024-12-28", day: 28, month: 12 }
        ];

        // Add IDs to pre-defined birthdays
        preDefinedBirthdays.forEach((birthday, index) => {
            birthday.id = 1000000 + index; // Use large IDs to avoid conflicts
        });

        // Merge with existing birthdays
        const existingNames = new Set(this.birthdays.map(b => b.name));
        const newBirthdays = preDefinedBirthdays.filter(b => !existingNames.has(b.name));
        
        this.birthdays = [...this.birthdays, ...newBirthdays];
        this.saveBirthdays();
    }
    
    initBirthdayEvents() {
        const form = document.getElementById('birthdayForm');
        const monthFilter = document.getElementById('monthFilter');
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBirthday();
        });

        monthFilter.addEventListener('change', () => {
            this.displayAllBirthdays();
        });

        // Tab navigation
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                
                // Update active tab
                tabButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Show/hide tab content
                document.getElementById('todayTab').style.display = tab === 'today' ? 'block' : 'none';
                document.getElementById('allTab').style.display = tab === 'all' ? 'block' : 'none';
                
                // Refresh displays
                if (tab === 'today') {
                    this.displayTodaysBirthdays();
                } else {
                    this.displayAllBirthdays();
                }
            });
        });

        this.displayTodaysBirthdays();
        this.displayAllBirthdays();
    }

    displayTodaysBirthdays() {
        const list = document.getElementById('todaysBirthdayList');
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        const todaysBirthdays = this.birthdays.filter(b => 
            b.month === currentMonth && b.day === currentDay
        );

        if (todaysBirthdays.length === 0) {
            list.innerHTML = '<p class="empty-message">Nenhum aniversariante hoje</p>';
            return;
        }

        list.innerHTML = todaysBirthdays.map(birthday => {
            const dateFormatted = `${birthday.day}/${birthday.month}`;
            return `
                <div class="birthday-item birthday-today">
                    <div class="birthday-info">
                        <div class="birthday-name">${birthday.name}</div>
                        <div class="birthday-date">${dateFormatted}</div>
                        <span class="today-badge">🎂 Hoje!</span>
                    </div>
                    <button class="delete-btn" onclick="birthdayManager.deleteBirthday(${birthday.id})">
                        ✕
                    </button>
                </div>
            `;
        }).join('');
    }

    displayAllBirthdays() {
        const list = document.getElementById('allBirthdayList');
        const monthFilter = document.getElementById('monthFilter').value;

        let displayBirthdays = this.birthdays;

        // Filter by month if selected
        if (monthFilter !== 'all') {
            displayBirthdays = this.birthdays.filter(b => b.month === parseInt(monthFilter));
        }

        // Sort by month and day
        displayBirthdays.sort((a, b) => {
            if (a.month === b.month) {
                return a.day - b.day;
            }
            return a.month - b.month;
        });

        if (displayBirthdays.length === 0) {
            list.innerHTML = '<p class="empty-message">Nenhum aniversariante encontrado</p>';
            return;
        }

        list.innerHTML = displayBirthdays.map(birthday => {
            const dateFormatted = `${birthday.day}/${birthday.month}`;
            const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            const monthName = monthNames[birthday.month - 1];
            
            return `
                <div class="birthday-item">
                    <div class="birthday-info">
                        <div class="birthday-name">${birthday.name}</div>
                        <div class="birthday-date">${dateFormatted} de ${monthName}</div>
                    </div>
                    <button class="delete-btn" onclick="birthdayManager.deleteBirthday(${birthday.id})">
                        ✕
                    </button>
                </div>
            `;
        }).join('');
    }

    addBirthday() {
        const name = document.getElementById('birthdayName').value.trim();
        const day = parseInt(document.getElementById('birthdayDay').value);
        const month = parseInt(document.getElementById('birthdayMonth').value);

        if (!name || !day || !month) return;

        const birthday = {
            id: Date.now(),
            name,
            date: `2024-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
            day: day,
            month: month
        };

        this.birthdays.push(birthday);
        this.saveBirthdays();
        
        // Refresh both displays
        this.displayTodaysBirthdays();
        this.displayAllBirthdays();
        
        // Clear form
        document.getElementById('birthdayForm').reset();
    }

    deleteBirthday(id) {
        const password = prompt('Digite a senha para remover aniversariante:');
        if (password !== "102030") {
            alert("Senha incorreta! Tente novamente.");
            return;
        }
        
        this.birthdays = this.birthdays.filter(b => b.id !== id);
        this.saveBirthdays();
        this.displayTodaysBirthdays();
        this.displayAllBirthdays();
    }

    displayBirthdays() {
        // This method is now split into displayTodaysBirthdays and displayAllBirthdays
        this.displayTodaysBirthdays();
        this.displayAllBirthdays();
    }

    loadBirthdays() {
        const saved = localStorage.getItem('apeBirthdays');
        return saved ? JSON.parse(saved) : [];
    }

    saveBirthdays() {
        localStorage.setItem('apeBirthdays', JSON.stringify(this.birthdays));
    }
}

class AppManager {
    constructor() {
        this.deferredPrompt = null;
        this.imageEditor = new ImageEditor();
        this.birthdayManager = new BirthdayManager();
        this.setupPWA();
        this.setupRealTimeClock();
        this.setupNavigation();
    }

    setupNavigation() {
        // Main menu buttons
        document.getElementById('bordasBtn').addEventListener('click', () => {
            this.showMenu('bordasMenu');
        });

        document.getElementById('bordasAniversarioBtn').addEventListener('click', () => {
            this.showMenu('bordasAniversarioMenu');
        });

        document.getElementById('aniversariantesBtn').addEventListener('click', () => {
            this.showMenu('aniversariantesMenu');
            this.birthdayManager.displayBirthdays();
        });

        document.getElementById('downloadApkBtn').addEventListener('click', () => {
            window.open('https://drive.usercontent.google.com/download?id=1qXSyxDkMhzCjrxwAtl9-qYxf_gCYJhrA&export=download&authuser=0', '_blank');
        });

        // Back buttons
        document.querySelectorAll('.back-btn-menu').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showMenu('mainMenu');
            });
        });

        // Menu option handlers for bordas
        document.querySelectorAll('#bordasMenu .menu-option[data-type]').forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                if (type) {
                    this.imageEditor.selectFrameType(type);
                    document.getElementById('bordasMenu').style.display = 'none';
                    document.getElementById('editorContainer').style.display = 'grid';
                }
            });
        });

        // Menu option handlers for bordas aniversário
        document.querySelectorAll('#bordasAniversarioMenu .frame-preview-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                if (type) {
                    this.imageEditor.selectFrameType(type);
                    document.getElementById('bordasAniversarioMenu').style.display = 'none';
                    document.getElementById('editorContainer').style.display = 'grid';
                }
            });
        });

        // Back button for editor
        document.getElementById('backBtn').addEventListener('click', () => {
            // Hide editor and show main menu directly
            document.getElementById('editorContainer').style.display = 'none';
            document.getElementById('mainMenu').style.display = 'block';
            
            // Hide any submenus
            document.getElementById('bordasMenu').style.display = 'none';
            document.getElementById('bordasAniversarioMenu').style.display = 'none';
            document.getElementById('aniversariantesMenu').style.display = 'none';
            
            this.imageEditor.resetSettings();
        });
    }

    showMenu(menuId) {
        // Hide all menus
        const menus = ['mainMenu', 'bordasMenu', 'bordasAniversarioMenu', 'aniversariantesMenu', 'editorContainer'];
        menus.forEach(menu => {
            document.getElementById(menu).style.display = 'none';
        });

        // Show selected menu
        document.getElementById(menuId).style.display = 'block';
        
        // Track last menu for back navigation
        if (menuId === 'bordasMenu') {
            this.lastMenu = 'bordas';
        } else if (menuId === 'bordasAniversarioMenu') {
            this.lastMenu = 'bordasAniversario';
        }
    }

    setupRealTimeClock() {
        const clockElement = document.getElementById('realTimeClock');
        
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            clockElement.textContent = `${hours}:${minutes}:${seconds}`;
        };
        
        // Update immediately and then every second
        updateClock();
        setInterval(updateClock, 1000);
    }

    setupPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                    // Fallback: try to register with current path
                    navigator.serviceWorker.register('./sw.js', { scope: './' })
                        .then((registration) => {
                            console.log('SW registered with fallback: ', registration);
                        })
                        .catch((err) => {
                            console.log('SW fallback registration failed: ', err);
                        });
                });
        }

        // Handle PWA install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        // Handle install button
        document.getElementById('installBtn')?.addEventListener('click', () => {
            this.installPWA();
        });

        document.getElementById('dismissBtn')?.addEventListener('click', () => {
            this.hideInstallPrompt();
        });

        document.getElementById('installPwaBtn')?.addEventListener('click', () => {
            if (this.deferredPrompt) {
                this.installPWA();
            } else {
                this.showInstallInstructions();
            }
        });

        // Update install button visibility
        this.updateInstallButton();
    }

    showInstallPrompt() {
        document.getElementById('installPrompt').classList.add('show');
    }

    hideInstallPrompt() {
        document.getElementById('installPrompt').classList.remove('show');
    }

    async installPWA() {
        if (!this.deferredPrompt) return;

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('PWA installed');
            document.getElementById('installPwaBtn').style.display = 'none';
        }

        this.deferredPrompt = null;
        this.hideInstallPrompt();
    }

    updateInstallButton() {
        if (window.matchMedia('(display-mode: standalone)').matches || 
            navigator.standalone ||
            document.referrer.includes('android-app://')) {
            // App is already installed
            document.getElementById('installPwaBtn').style.display = 'none';
        }
    }

    showInstallInstructions() {
        document.getElementById('installationGuide').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Ensure DOM is fully loaded
    setTimeout(() => {
        window.birthdayManager = new AppManager().birthdayManager;
    }, 100);
});

// Also add a fallback initialization
window.addEventListener('load', () => {
    if (!window.birthdayManager) {
        try {
            window.birthdayManager = new AppManager().birthdayManager;
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }
});

// Tela de carregamento
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    const appContainer = document.getElementById('appContainer');
    
    // Aguardar 5 segundos antes de mostrar o app
    setTimeout(() => {
        // Fade out da tela de carregamento
        loadingScreen.style.transition = 'opacity 0.5s ease-out';
        loadingScreen.style.opacity = '0';
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            appContainer.style.display = 'block';
            
            // Fade in do app
            appContainer.style.opacity = '0';
            appContainer.style.transition = 'opacity 0.5s ease-in';
            setTimeout(() => {
                appContainer.style.opacity = '1';
            }, 50);
            
            // Inicializar o app
            if (!window.birthdayManager) {
                window.birthdayManager = new AppManager().birthdayManager;
            }
        }, 500);
    }, 5000); // 5 segundos
});