// Получение элементов DOM
const grid = document.getElementById("grid");
const playButton = document.getElementById("play");
const stopButton = document.getElementById("stop");
const clearButton = document.getElementById("clear");
const notesContainer = document.getElementById("notes");
const speedControl = document.getElementById("speed");
const volumeControl = document.getElementById("volume");
const waveTypeSelect = document.getElementById("waveType");
const saveButton = document.getElementById("save");
const loadButton = document.getElementById("load");
const loopCheckbox = document.getElementById("loop");
const saveAudioButton = document.getElementById("saveAudio");
const enableVibrationCheckbox = document.getElementById("enableVibration");

// Ноты: диезы и бемоли
const notes = [
    "C2", "C#2", "Db2", "D2", "D#2", "Eb2", "E2", "F2", "F#2", "Gb2", "G2", "G#2", "Ab2", "A2", "A#2", "Bb2", "B2", 
    "C3", "C#3", "Db3", "D3", "D#3", "Eb3", "E3", "F3", "F#3", "Gb3", "G3", "G#3", "Ab3", "A3", "A#3", "Bb3", "B3", 
    "C4", "C#4", "Db4", "D4", "D#4", "Eb4", "E4", "F4", "F#4", "Gb4", "G4", "G#4", "Ab4", "A4", "A#4", "Bb4", "B4", 
    "C5", "C#5", "Db5", "D5", "D#5", "Eb5", "E5", "F5", "F#5", "Gb5", "G5", "G#5", "Ab5", "A5", "A#5", "Bb5", "B5", 
    "C6", "C#6", "Db6", "D6", "D#6", "Eb6", "E6", "F6", "F#6", "Gb6", "G6", "G#6", "Ab6", "A6", "A#6", "Bb6", "B6"
];

// Константы и начальные данные
const rows = notes.length;
const cols = 16;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let activeCells = Array(rows).fill(null).map(() => Array(cols).fill(false));
let durations = Array(rows).fill(null).map(() => Array(cols).fill(300)); 
let playbackQueue = [];
let isLooping = false;
let savedMelody = [];
let globalVolume = 0.5;
let playbackSpeed = 300;
let isVibrationEnabled = enableVibrationCheckbox.checked;

// Отображение нот
notes.forEach((note) => {
    const noteLabel = document.createElement("div");
    noteLabel.textContent = note;
    noteLabel.style.height = "30px";
    noteLabel.style.display = "flex";
    noteLabel.style.alignItems = "center";
    noteLabel.style.justifyContent = "flex-end";
    noteLabel.style.marginRight = "10px";
    notesContainer.appendChild(noteLabel);
});

for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = i;
        cell.dataset.col = j;

        // Добавляем название ноты в ячейку
        cell.textContent = notes[i];

        // Стиль текста для ячейки
        cell.style.fontSize = "10px";
        cell.style.textAlign = "center";
        cell.style.lineHeight = "30px";

        // Контекстное меню для задания длительности
        cell.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            const duration = prompt("Введите длительность ноты (мс):", durations[i][j]);
            if (duration && !isNaN(duration)) {
                durations[i][j] = parseInt(duration);
            }
        });

        grid.appendChild(cell);
    }
}

// Обработка кликов
grid.addEventListener("click", (e) => {
    const cell = e.target;
    if (cell.classList.contains("cell")) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (activeCells[row][col]) {
            playbackQueue = playbackQueue.filter(item => !(item.row === row && item.col === col));
        } else {
            playbackQueue.push({ row, col });
        }

        activeCells[row][col] = !activeCells[row][col];
        cell.classList.toggle("active");
    }
});

// Воспроизведение
playButton.addEventListener("click", () => {
    if (isPlaying) return;

    isPlaying = true;
    playButton.disabled = true;

    const playMelody = () => {
        playbackQueue.forEach((item, index) => {
            const { row, col } = item;
            const note = notes[row];
            const duration = durations[row][col];

            setTimeout(() => {
                if (!isPlaying) return;
                playNote(note, duration);
            }, index * playbackSpeed);
        });

        if (isLooping && isPlaying) {
            setTimeout(playMelody, playbackQueue.length * playbackSpeed);
        } else {
            setTimeout(() => {
                isPlaying = false;
                playButton.disabled = false;
            }, playbackQueue.length * playbackSpeed);
        }
    };

    playMelody();
});

// Остановка
stopButton.addEventListener("click", stopPlayback);

function stopPlayback() {
    isPlaying = false;
    playButton.disabled = false;
    clearTimeouts();
}

// Очистка таймеров
function clearTimeouts() {
    let id = window.setTimeout(() => {}, 0);
    while (id--) {
        window.clearTimeout(id);
    }
}

// Очистка сетки
clearButton.addEventListener("click", () => {
    activeCells = Array(rows).fill(null).map(() => Array(cols).fill(false));
    durations = Array(rows).fill(null).map(() => Array(cols).fill(300));
    playbackQueue = [];
    document.querySelectorAll(".cell").forEach(cell => cell.classList.remove("active"));
});

// Сохранение мелодии
saveButton.addEventListener("click", () => {
    savedMelody = playbackQueue.map(({ row, col }) => ({
        note: notes[row],
        col,
        duration: durations[row][col]
    }));
    alert("Мелодия сохранена!");
});

// Загрузка мелодии
loadButton.addEventListener("click", () => {
    if (!savedMelody.length) {
        alert("Нет сохраненной мелодии!");
        return;
    }

    activeCells = Array(rows).fill(null).map(() => Array(cols).fill(false));
    durations = Array(rows).fill(null).map(() => Array(cols).fill(300));
    playbackQueue = [];

    savedMelody.forEach(({ note, col, duration }) => {
        const row = notes.indexOf(note);
        if (row === -1) return;

        activeCells[row][col] = true;
        durations[row][col] = duration;
        playbackQueue.push({ row, col });

        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) cell.classList.add("active");
    });

    alert("Мелодия загружена!");
});

// Преобразование ноты в частоту
function noteToFrequency(note) {
    const A4 = 440;
    const sharpNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const flatNotes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    const octave = parseInt(note.slice(-1));
    const key = note.slice(0, -1);

    let keyNumber = sharpNotes.indexOf(key);
    if (keyNumber === -1) {
        keyNumber = flatNotes.indexOf(key);
    }
    if (keyNumber === -1) {
        throw new Error(`Нота "${note}" не распознана.`);
    }

    return A4 * Math.pow(2, (keyNumber + (octave - 4) * 12 - 9) / 12);
}

// Воспроизведение ноты
function playNote(note, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    const frequency = noteToFrequency(note);
    oscillator.type = waveTypeSelect.value;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    const baseGain = globalVolume;
    gainNode.gain.setValueAtTime(baseGain, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration / 1000);

    if (isVibrationEnabled && "vibrate" in navigator) {
        navigator.vibrate(duration);
    }
}

// Управление параметрами
speedControl.addEventListener("input", (e) => {
    playbackSpeed = parseInt(e.target.value);
});

volumeControl.addEventListener("input", (e) => {
    globalVolume = parseFloat(e.target.value);
});

loopCheckbox.addEventListener("change", (e) => {
    isLooping = e.target.checked;
});

enableVibrationCheckbox.addEventListener("change", (e) => {
    isVibrationEnabled = e.target.checked;
});

// Сохранение мелодии как аудиофайл
saveAudioButton.addEventListener("click", saveMelodyAsAudio);

async function saveMelodyAsAudio() {
    const offlineAudioContext = new OfflineAudioContext(1, 44100 * 10, 44100);
    let currentTime = 0;

    playbackQueue.forEach(({ row, col }) => {
        const note = notes[row];
        const duration = durations[row][col] / 1000; // Конвертируем в секунды
        const frequency = noteToFrequency(note);

        const oscillator = offlineAudioContext.createOscillator();
        const gainNode = offlineAudioContext.createGain();

        oscillator.type = waveTypeSelect.value;
        oscillator.frequency.setValueAtTime(frequency, currentTime);
        gainNode.gain.setValueAtTime(globalVolume, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(offlineAudioContext.destination);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + duration);

        currentTime += duration + playbackSpeed / 1000; // Учитываем паузу
    });

    const renderedBuffer = await offlineAudioContext.startRendering();

    const wavFile = createWAVFile(renderedBuffer);

    const blob = new Blob([wavFile], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "melody.wav";
    a.click();

    URL.revokeObjectURL(url);
}

function createWAVFile(buffer) {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length * numberOfChannels;
    const data = new Float32Array(length);
    const interleaved = new Int16Array(length);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
        data.set(buffer.getChannelData(i), i * buffer.length);
    }

    for (let i = 0; i < length; i++) {
        interleaved[i] = Math.max(-1, Math.min(1, data[i])) * 0x7FFF;
    }

    const wavHeader = new Uint8Array(44);
    const view = new DataView(wavHeader.buffer);

    view.setUint32(0, 0x46464952, true); // "RIFF"
    view.setUint32(4, 36 + interleaved.length * 2, true); // File size
    view.setUint32(8, 0x45564157, true); // "WAVE"
    view.setUint32(12, 0x20746D66, true); // "fmt "
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // Audio format
    view.setUint16(22, numberOfChannels, true); // Number of channels
    view.setUint32(24, sampleRate, true); // Sample rate
    view.setUint32(28, sampleRate * numberOfChannels * 2, true); // Byte rate
    view.setUint16(32, numberOfChannels * 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    view.setUint32(36, 0x61746164, true); // "data"
    view.setUint32(40, interleaved.length * 2, true); // Data size

    const wavFile = new Uint8Array(wavHeader.length + interleaved.length * 2);
    wavFile.set(wavHeader, 0);
    wavFile.set(new Uint8Array(interleaved.buffer), wavHeader.length);

    return wavFile;
}

// Проверка поддержки вибрации
function isVibrationSupported() {
    return "vibrate" in navigator;
}

// Обработчик нажатия на кнопку
saveAudioButton.addEventListener("click", saveMelodyAsAudio);

// Создание сетки с названиями нот
for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = i;
        cell.dataset.col = j;

        // Добавляем название ноты в ячейку
        cell.textContent = notes[i];

        // Стиль текста для ячейки
        cell.style.fontSize = "10px";
        cell.style.textAlign = "center";
        cell.style.lineHeight = "30px";

        // Контекстное меню для задания длительности
        cell.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            const duration = prompt("Введите длительность ноты (мс):", durations[i][j]);
            if (duration && !isNaN(duration)) {
                durations[i][j] = parseInt(duration);
            }
        });

        grid.appendChild(cell);
    }
}

// Создание сетки с подсказками
/*for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = i;
        cell.dataset.col = j;

        // Добавляем подсказку с названием ноты
        cell.title = `Нота: ${notes[i]}`;

        grid.appendChild(cell);
    }
}*/

