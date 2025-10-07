// Reproductor de música Lo-Fi
class AudioPlayer {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.currentTrackIndex = 0;
        this.currentTime = 0;
        
        // Handlers para poder remover event listeners
        this.canPlayHandler = null;
        this.errorHandler = null;
        this.endedHandler = null;
        this.timeUpdateHandler = null;
        this.playbackStarted = false;
        this.playlist = [
            {
                title: "Calm 1 - Minecraft",
                artist: "Mojang",
                url: "assets/music/calm1.mp3",
                cover: "https://blizzstoreperu.com/cdn/shop/products/comprarminecraftjavaybedrock_png.jpg?v=1659543980"
            },
            {
                title: "Chill Vibes",
                artist: "Creative Commons",
                url: "assets/music/good-night-lofi-cozy-chill-music-160166.mp3",
                cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center"
            },
            {
                title: "Coffee Shop Ambience",
                artist: "Public Domain",
                url: "assets/music/lofi-study-calm-peaceful-chill-hop-112191.mp3",
                cover: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&h=300&fit=crop&crop=center"
            }
        ];
        
        this.loadAudioState();
        this.init();
        this.setupPageChangeListener();
    }
    
    init() {
        this.audio = new Audio();
        this.setupEventListeners();
        this.updateTrackInfo();
    }
    
    setupEventListeners() {
        // Botones del reproductor
        document.getElementById('playBtn')?.addEventListener('click', () => this.togglePlay());
        document.getElementById('prevBtn')?.addEventListener('click', () => this.previousTrack());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextTrack());
        document.getElementById('volumeSlider')?.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // Barra de progreso interactiva
        this.setupProgressBarInteraction();
    }
    
    setupProgressBarInteraction() {
        const progressBarBg = document.querySelector('.progress-bar-bg');
        if (progressBarBg) {
            progressBarBg.addEventListener('click', (e) => this.seekToPosition(e));
            progressBarBg.style.cursor = 'pointer';
            
            // Soporte para arrastrar
            let isDragging = false;
            
            progressBarBg.addEventListener('mousedown', (e) => {
                isDragging = true;
                this.seekToPosition(e);
            });
            
            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    this.seekToPosition(e);
                }
            });
            
            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
            
            // Soporte táctil para dispositivos móviles
            progressBarBg.addEventListener('touchstart', (e) => {
                e.preventDefault();
                isDragging = true;
                this.seekToPosition(e.touches[0]);
            });
            
            document.addEventListener('touchmove', (e) => {
                if (isDragging) {
                    e.preventDefault();
                    this.seekToPosition(e.touches[0]);
                }
            });
            
            document.addEventListener('touchend', () => {
                isDragging = false;
            });
        }
    }
    
    seekToPosition(event) {
        if (!this.audio || !this.audio.duration) return;
        
        const progressBarBg = document.querySelector('.progress-bar-bg');
        if (!progressBarBg) return;
        
        const rect = progressBarBg.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const width = rect.width;
        
        // Asegurar que el click esté dentro de los límites
        const percentage = Math.max(0, Math.min(1, clickX / width));
        
        // Calcular el nuevo tiempo basado en el porcentaje
        const newTime = percentage * this.audio.duration;
        
        // Establecer el nuevo tiempo
        this.audio.currentTime = newTime;
        this.currentTime = newTime;
        
        // Actualizar la barra de progreso inmediatamente
        this.updateProgress();
        
        // Guardar el estado solo si no estamos arrastrando (para evitar demasiadas escrituras)
        if (!event.type.includes('move')) {
            this.saveAudioState();
        }
        
        console.log(`Saltando a: ${Math.round(newTime)}s (${Math.round(percentage * 100)}%)`);
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    play() {
        const currentTrack = this.playlist[this.currentTrackIndex];
        
        // Limpiar completamente el audio anterior
        this.cleanupAudio();
        
        // Crear un nuevo objeto Audio para evitar problemas de caché
        this.audio = new Audio();
        this.audio.crossOrigin = "anonymous";
        
        // Configurar todos los event listeners para el nuevo objeto Audio
        this.setupAudioEventListeners();
        
        this.audio.src = currentTrack.url;
        
        // Intentar cargar el audio
        this.audio.load();
    }
    
    startPlayback() {
        // Método separado para iniciar la reproducción sin crear nuevo Audio
        if (!this.audio || this.playbackStarted) return;
        
        this.playbackStarted = true;
        
        // Restaurar el tiempo guardado si existe
        if (this.currentTime > 0) {
            this.audio.currentTime = this.currentTime;
            console.log(`Restaurando tiempo: ${this.currentTime}s`);
        }
        
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updatePlayButton();
            console.log('Reproduciendo:', this.playlist[this.currentTrackIndex].title);
        }).catch(error => {
            console.log('Error al reproducir audio (probablemente bloqueado por autoplay):', error);
            this.playbackStarted = false; // Reset flag si falla
            // El audio se activará con el próximo clic del usuario
        });
    }
    
    setupAudioEventListeners() {
        if (!this.audio) return;
        
        // Crear handlers nombrados para poder removerlos después
        this.canPlayHandler = () => {
            this.startPlayback();
        };
        
        this.errorHandler = (e) => {
            console.log('Error al cargar audio:', e);
            // El audio se activará con el próximo clic del usuario
        };
        
        this.endedHandler = () => this.nextTrack();
        this.timeUpdateHandler = () => this.updateProgress();
        
        // Configurar eventos de audio
        this.audio.addEventListener('canplaythrough', this.canPlayHandler);
        this.audio.addEventListener('error', this.errorHandler);
        this.audio.addEventListener('ended', this.endedHandler);
        this.audio.addEventListener('timeupdate', this.timeUpdateHandler);
    }
    
    
    
    resumeAudio() {
        // Método para reanudar el audio después de la interacción del usuario
        console.log('Intentando reproducir después de interacción del usuario');
        
        // Evitar múltiples llamadas simultáneas
        /*if (this.isPlaying) {
            console.log('Ya se está reproduciendo, ignorando llamada duplicada');
            return;
        }*/
        
        this.play(); // Intentar reproducir nuevamente
    }
    
    cleanupAudio() {
        // Método para limpiar completamente el audio anterior
        if (this.audio) {
            this.audio.pause();
            this.audio.src = '';
            this.audio.load();
            
            // Remover todos los event listeners
            if (this.canPlayHandler) {
                this.audio.removeEventListener('canplaythrough', this.canPlayHandler);
            }
            if (this.errorHandler) {
                this.audio.removeEventListener('error', this.errorHandler);
            }
            if (this.endedHandler) {
                this.audio.removeEventListener('ended', this.endedHandler);
            }
            if (this.timeUpdateHandler) {
                this.audio.removeEventListener('timeupdate', this.timeUpdateHandler);
            }
            
            this.audio = null;
        }
        
        // Resetear bandera de reproducción
        this.playbackStarted = false;
    }
    
    pause() {
        if (this.audio && this.audio.pause) {
            this.audio.pause();
        }
        this.isPlaying = false;
        this.playbackStarted = false; // Resetear bandera
        this.updatePlayButton();
        this.saveAudioState();
    }
    
    nextTrack() {
        this.pause();
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.currentTime = 0; // Resetear tiempo para nueva canción
        this.updateTrackInfo();
        this.saveAudioState();
        this.play();
    }
    
    previousTrack() {
        this.pause();
        this.currentTrackIndex = this.currentTrackIndex === 0 ? 
            this.playlist.length - 1 : this.currentTrackIndex - 1;
        this.currentTime = 0; // Resetear tiempo para nueva canción
        this.updateTrackInfo();
        this.saveAudioState();
        this.play();
    }
    
    setVolume(volume) {
        this.audio.volume = volume / 100;
    }
    
    updatePlayButton() {
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.innerHTML = this.isPlaying ? 
                '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        }
    }
    
    updateTrackInfo() {
        const currentTrack = this.playlist[this.currentTrackIndex];
        
        const titleElement = document.getElementById('trackTitle');
        const artistElement = document.getElementById('trackArtist');
        const coverElement = document.getElementById('trackCover');
        
        if (titleElement) titleElement.textContent = currentTrack.title;
        if (artistElement) artistElement.textContent = currentTrack.artist;
        if (coverElement) coverElement.src = currentTrack.cover;
    }
    
    updateProgress() {
        const progressBar = document.getElementById('progressBar');
        if (progressBar && this.audio && this.audio.duration && !isNaN(this.audio.duration)) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            progressBar.style.width = progress + '%';
            
            // Guardar el tiempo actual cada segundo
            this.currentTime = this.audio.currentTime;
            this.saveAudioState();
            
            // Debug: mostrar progreso en consola cada 5 segundos
            if (Math.floor(this.audio.currentTime) % 5 === 0 && this.audio.currentTime > 0) {
                console.log(`Progreso: ${Math.round(progress)}% (${Math.round(this.audio.currentTime)}s / ${Math.round(this.audio.duration)}s)`);
            }
        }
    }
    
    saveAudioState() {
        const audioState = {
            currentTrackIndex: this.currentTrackIndex,
            currentTime: this.currentTime,
            isPlaying: this.isPlaying,
            timestamp: Date.now()
        };
        localStorage.setItem('lofiPlayerState', JSON.stringify(audioState));
    }
    
    loadAudioState() {
        try {
            const savedState = localStorage.getItem('lofiPlayerState');
            if (savedState) {
                const audioState = JSON.parse(savedState);
                
                // Solo restaurar si el estado es reciente (menos de 1 hora)
                const oneHour = 60 * 60 * 1000;
                if (Date.now() - audioState.timestamp < oneHour) {
                    this.currentTrackIndex = audioState.currentTrackIndex || 0;
                    this.currentTime = audioState.currentTime || 0;
                    this.isPlaying = audioState.isPlaying || false;
                    
                    console.log('Estado del audio restaurado:', audioState);
                }
            }
        } catch (error) {
            console.log('Error al cargar estado del audio:', error);
        }
    }
    
    setupPageChangeListener() {
        // Detectar cuando el usuario está a punto de cambiar de página
        window.addEventListener('beforeunload', () => {
            // Pausar el audio y marcar como no reproduciéndose
            if (this.audio && this.isPlaying) {
                //this.audio.pause();
            }
            //this.isPlaying = false;
            this.playbackStarted = false;
            this.saveAudioState();
            console.log('Página cambiando - audio pausado');
        });
        
        // También detectar cuando la página pierde el foco (opcional)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isPlaying) {
                // Opcional: pausar cuando la página pierde el foco
                // this.pause();
            }
        });
    }
}

// Inicializar el reproductor cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.audioPlayer = new AudioPlayer();
    
    // Activar música con cualquier clic en la página
    let audioActivated = false;
    
    const activateAudioOnClick = (event) => {
        if (!audioActivated) {
            console.log('Clic detectado - activando reproductor de música');
            
            // Solo activar si el estado guardado indica que estaba reproduciéndose
            const savedState = localStorage.getItem('lofiPlayerState');
            if (savedState) {
                try {
                    const audioState = JSON.parse(savedState);
                    if (audioState.isPlaying) {
                        window.audioPlayer.resumeAudio();
                    } else {
                        console.log('Estado guardado indica que estaba pausado - no activando automáticamente');
                    }
                } catch (error) {
                    console.log('Error al leer estado guardado:', error);
                }
            } else {
                // Si no hay estado guardado, activar normalmente
                window.audioPlayer.resumeAudio();
            }
            
            audioActivated = true;
            
            // Remover el listener después del primer clic
            document.removeEventListener('click', activateAudioOnClick);
            document.removeEventListener('touchstart', activateAudioOnClick);
        }
    };
    
    // Escuchar clics y toques
    document.addEventListener('click', activateAudioOnClick);
    document.addEventListener('touchstart', activateAudioOnClick);
});

// Función para alternar la visibilidad del reproductor
function togglePlayer() {
    const player = document.getElementById('lofiPlayer');
    const toggleBtn = document.getElementById('playerToggle');
    
    if (player && toggleBtn) {
        player.classList.toggle('player-hidden');
        toggleBtn.innerHTML = player.classList.contains('player-hidden') ? 
            '<i class="fas fa-music"></i>' : '<i class="fas fa-times"></i>';
    }
}