function getScriptParams() {
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
        if (script.src.includes('script.js')) {
            const params = new URL(script.src).searchParams;
            return {
                id: params.get('id'),
                token: params.get('token')
            };
        }
    }
    return {};
}

const { id, token } = getScriptParams();
let dataUrl = "";

async function fetchDataUrl(dataLayerData) {
    if (!id || !token) {
        console.error('ID ou Token não foram fornecidos na URL do script');
        return;
    }
    try {
        const response = await fetch('https://integrador.apollocompany.com.br/webhook-test/8a4c54f0-a31b-4e88-a97e-7b4c01b158ba', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, token, ...dataLayerData })
        });
        if (!response.ok) {
            throw new Error('Erro na solicitação da API');
        }
        const data = await response.json();
        dataUrl = data.url;
        console.log('dataUrl:', dataUrl);  // Certifique-se de que dataUrl foi atualizado corretamente
        initializeVideo(dataUrl); // Chame a função para inicializar o vídeo após a URL ser obtida
    } catch (error) {
        console.error('Erro na consulta do vídeo:', error);
    }
}

function getDataLayer() {
    document.addEventListener("DOMContentLoaded", function () {
        var dataLayer = window.dataLayer || [];
        if (dataLayer.length > 0) {
            var latestData = dataLayer[dataLayer.length - 1];
            if (latestData.event === 'view_item') {
                var ecommerceData = latestData.ecommerce;
                var dataLayerData = {
                    event: latestData.event,
                    ecommerce: ecommerceData,
                    uniqueEventId: latestData['gtm.uniqueEventId']
                };
                // Chama a função fetchDataUrl com os dados do dataLayer
                fetchDataUrl(dataLayerData);
            } else {
                console.log('Evento não é view_item');
                fetchDataUrl({});
            }
        } else {
            console.log('dataLayer está vazio');
            fetchDataUrl({});
        }
    });
}

function initializeVideo(url) {
    // Estilos
    const style = document.createElement('style');
    style.textContent = `

        @keyframes border-animation {
            0% {
                border-color: yellow;
            }
            50% {
                border-color: #d86100;
            }
            100% {
                border-color: yellow;
            }                
        }


        #video-circle {
            position: fixed;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            overflow: hidden;
            cursor: pointer;
            z-index: 1000;
            border: 5px solid yellow;
            animation: border-animation 2s linear infinite;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.6); /* Adiciona sombra ao círculo */

        }

        #small-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        #video-popup.hidden {
            display: none;
        }

        #video-popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;

        }

        .popup-content {
            position: relative;
            background-color: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 10px;
        }

        #full-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border: 5px solid yellow;
            animation: border-animation 1s linear infinite;
            border-radius: 20px
        }

        #close-popup {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 2rem;
            color: #fff;
            cursor: pointer;
            z-index: 10;
        }
    `;
    document.head.appendChild(style);

    // HTML
    const videoCircleHTML = `
        <div id="video-circle">
            <video id="small-video" src="${url}" autoplay loop muted></video>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', videoCircleHTML);

    const videoPopupHTML = `
        <div id="video-popup" class="hidden">
            <div class="popup-content">
                <button id="close-popup">&times;</button>
                <video id="full-video" src="${url}" autoplay></video>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', videoPopupHTML);

    // JavaScript
    const videoCircle = document.getElementById("video-circle");
    const videoPopup = document.getElementById("video-popup");
    const fullVideo = document.getElementById("full-video");
    const closePopupButton = document.getElementById("close-popup");

    let isDragging = false;
    let offsetX, offsetY;
    let clickTime;

    videoCircle.addEventListener("mousedown", function(e) {
        isDragging = false;
        clickTime = Date.now();
        offsetX = e.clientX - videoCircle.getBoundingClientRect().left;
        offsetY = e.clientY - videoCircle.getBoundingClientRect().top;
        document.addEventListener("mousemove", onMouseMove);
    });

    document.addEventListener("mouseup", function(e) {
        document.removeEventListener("mousemove", onMouseMove);
        if (Date.now() - clickTime < 200) {
            onCircleClick(e);
        }
        isDragging = false;
    });

    function onMouseMove(e) {
        isDragging = true;
        videoCircle.style.left = `${e.clientX - offsetX}px`;
        videoCircle.style.top = `${e.clientY - offsetY}px`;
    }

    function onCircleClick(e) {
        if (!isDragging) {
            videoPopup.classList.remove("hidden");
            adjustPopupSize();
            fullVideo.play();
        }
    }

    closePopupButton.addEventListener("click", function() {
        videoPopup.classList.add("hidden");
        fullVideo.pause();
        fullVideo.currentTime = 0;
    });

    videoPopup.addEventListener("click", function(e) {
        if (e.target === videoPopup) {
            videoPopup.classList.add("hidden");
            fullVideo.pause();
            fullVideo.currentTime = 0;
        }
    });

    fullVideo.addEventListener("ended", function() {
        fullVideo.currentTime = 0;
        fullVideo.play();
    });

    function adjustPopupSize() {
        const videoAspectRatio = fullVideo.videoWidth / fullVideo.videoHeight;
        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.8;

        let popupWidth, popupHeight;

        if (maxWidth / maxHeight > videoAspectRatio) {
            popupHeight = maxHeight;
            popupWidth = maxHeight * videoAspectRatio;
        } else {
            popupWidth = maxWidth;
            popupHeight = maxWidth / videoAspectRatio;
        }

        const popupContent = document.querySelector('.popup-content');
        popupContent.style.width = `${popupWidth}px`;
        popupContent.style.height = `${popupHeight}px`;
    }
}

// Executa a função getDataLayer para obter os dados do dataLayer e iniciar o processo de fetch da URL do vídeo
getDataLayer();
