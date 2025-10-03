document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    const pageSections = document.querySelectorAll('.page-section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetPageId = this.getAttribute('data-page');

            // Gestionar clase 'active' en los enlaces
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Ocultar todas las secciones
            pageSections.forEach(section => {
                section.classList.remove('active');
            });

            // Mostrar la sección objetivo
            const targetPage = document.getElementById(`page-${targetPageId}`);
            if (targetPage) {
                targetPage.classList.add('active');
            }
        });
    });
});

VANTA.NET({
    el: "#body",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    color: 0x00a2ff, // Azure vibrante de la paleta
    backgroundColor: 0x12121200, // Fondo oscuro de la paleta
    points: 20.00,
    maxDistance: 23.00,
    spacing: 17.00
  })