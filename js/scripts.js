document.addEventListener('DOMContentLoaded', () => {

    // Proje verilerini burada merkezi bir yerde tutuyoruz.
    // HTML'i temiz tutar ve yönetimi kolaylaştırır.
    const projectData = {
        'tone-polish': {
            title: '📝 TonePolish',
            color: 'var(--neon-yellow)',
            content: `
                <h3>✨ Emotion- & Tone-Aware Text Rewriter for Professional English Communication</h3>
                <p>TonePolish is an NLP-powered web application that helps users rewrite any sentence into a more polished, clear, and professional version — tailored to the tone they choose.</p>
                
                <h3>🧠 Motivation</h3>
                <p>Writing professionally can be tricky, especially for non-native speakers. TonePolish solves that by offering real-time tone-aware rewriting, powered by open-source LLMs, for LinkedIn posts, job applications, and emails.</p>
                
                <h3>🚀 What It Does</h3>
                <ul>
                    <li>Analyzes the emotional tone of your original sentence (positive, negative, neutral).</li>
                    <li>Rewrites the input sentence in your desired tone: Friendly, Confident, Humble, or Formal.</li>
                    <li>Outputs the original vs. rewritten text side-by-side for comparison.</li>
                </ul>

                <h3>🧱 Tech Stack</h3>
                <ul>
                    <li><strong>Frontend (UI):</strong> Streamlit</li>
                    <li><strong>Backend Logic:</strong> Pure Python</li>
                    <li><strong>Emotion Detection:</strong> HuggingFace Transformers (distilbert-base-uncased)</li>
                    <li><strong>Tone Rewriting:</strong> HuggingFace Transformers (Nous Hermes 2 - Mistral 7B)</li>
                </ul>
            `
        },
        'object-detection': {
            title: 'Real-Time Object Detection',
            color: 'var(--neon-yellow)',
            content: `<h3>Coming Soon</h3><p>Detailed information for this project will be added soon.</p>`
        },
        'rover-simulation': {
            title: 'Autonomous Rover Simulation',
            color: 'var(--neon-yellow)',
            content: `<h3>Coming Soon</h3><p>Detailed information for this project will be added soon.</p>`
        },
        'face-recognition': {
            title: 'Face Recognition System',
            color: 'var(--neon-yellow)',
            content: `<h3>Coming Soon</h3><p>Detailed information for this project will be added soon.</p>`
        }
    };

    const projectCards = document.querySelectorAll('.project-card');
    const modal = document.getElementById('project-modal');
    const modalContentBody = document.getElementById('modal-body-content');
    const closeModalButton = document.querySelector('.modal-close');

    // Her bir proje kartına tıklama olayı ekliyoruz
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.getAttribute('data-project-id');
            openModal(projectId);
        });
    });

    // Modal'ı açan fonksiyon
    function openModal(projectId) {
        const data = projectData[projectId];
        if (!data) return;

        // Modal içeriğini proje verileriyle dolduruyoruz
        modalContentBody.innerHTML = data.content;
        // Başlığın rengini dinamik olarak değiştirebiliriz (isteğe bağlı)
        modalContentBody.querySelector('h2, h3').style.color = data.color;


        modal.classList.add('active');
    }

    // Modal'ı kapatan fonksiyon
    function closeModal() {
        modal.classList.remove('active');
    }

    // Kapatma butonuna tıklayınca modal'ı kapat
    closeModalButton.addEventListener('click', closeModal);

    // Modal'ın dışına (gri alana) tıklayınca modal'ı kapat
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
});