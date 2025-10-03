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