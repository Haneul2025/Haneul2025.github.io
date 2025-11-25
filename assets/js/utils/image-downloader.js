/**
 * 이미지 다운로드 유틸리티
 * - html2canvas를 사용하여 결과 카드를 이미지로 변환
 */

function downloadImage() {
    const resultContainer = document.querySelector('.result-container');
    const buttonContainer = document.querySelector('.button-container');

    resultContainer.classList.add('saving-mode');
    buttonContainer.style.display = 'none';

    setTimeout(() => {
        html2canvas(resultContainer, {
            width: 1080,
            height: 1920,
            scale: 2,
            logging: false,
            useCORS: true
        }).then(canvas => {
            resultContainer.classList.remove('saving-mode');
            buttonContainer.style.display = '';

            const link = document.createElement('a');
            link.download = '걸음을 향한 말씀.png';
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        });
    }, 200);
}

function autoResizeText(element, maxHeight, minSize = 20, maxSize = 34) {
    let fontSize = maxSize;
    element.style.fontSize = fontSize + "px";

    while (element.scrollHeight > maxHeight && fontSize > minSize) {
        fontSize--;
        element.style.fontSize = fontSize + "px";
    }
}

function enableSavingMode() {
    const resultContainer = document.querySelector(".result-container");
    const verse = document.getElementById("verseContent");
    const card = document.getElementById("verseCard");

    resultContainer.classList.add("saving-mode");

    setTimeout(() => {
        if (verse && card) {
            autoResizeText(verse, card.clientHeight * 0.6, 20, 34);
        }
    }, 50);
}

function disableSavingMode() {
    const resultContainer = document.querySelector(".result-container");
    resultContainer.classList.remove("saving-mode");
}


