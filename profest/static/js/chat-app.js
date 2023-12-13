"use strict";
// import html2canvas from 'html2canvas';
class ChatApp {
    questions = [
        'Привет! Как вас зовут? Укажите фамилию и имя',
        'Сколько вам лет? Не стесняйтесь, возраст - признак истинной мудрости',
        'В какой сфере вы раскрываете свой талант на работе? Укажите свою профессию',
        'Сколько времени вы уже занимаетесь своим делом? Напишите число',
        'В каком уголке мира свершаются ваши профессиональные подвиги? Укажите город',
        'Ваш месячный доход? Напишите сумму',
        'Укажите свой никнейм в Telegram (или номер телефона, если Telegram не установлен)',
        'Записать вас на онлайн-фестиваль? На нём будет много интересного и полезного для карьеры'
    ];
    currentQuestionIndex = 0;
    userAnswers = {
        fio: '',
        age: '0',
        profession: '',
        experience: '0',
        city: '',
        monthly_income: '0',
        telegram: '',
        phone: '',
        referrer: '',
        visit_duration: '0',
        device: '',
        want_event: 'N',
        hourly_income: '0'
    };
    sectionChat = null;
    sectionResult = null;
    chat = null;
    chatMessages = null;
    userInput = null;
    popup = null;
    popupBtn = null;
    startTime = 0;
    userId = null;
    isChatFilled = false;
    buttonChat = null;
    scrollButtons = null;
    buttonResult = null;
    popupRate = null;
    popupDescription = null;
    popupImg = null;
    popupTitle = null;
    popupContainer = null;
    constructor() {
        this.sectionChat = document.getElementById('section-chat');
        this.sectionResult = document.getElementById('section-result');
        this.chat = document.getElementById('chat');
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.buttonChat = document.getElementById('send-button');
        this.scrollButtons = document.querySelectorAll('.scroll-button');
        this.buttonResult = document.getElementById('btn-result');
        this.popupRate = document.getElementById('popup-rate');
        this.popup = document.getElementById('popup');
        this.popupBtn = document.getElementById('popup-btn-close');
        this.popupDescription = document.getElementById('popup-description');
        this.popupImg = document.getElementById('popup-img');
        this.popupTitle = document.getElementById('popup-title');
        this.popupContainer = document.getElementById('popup-container');
        this.startTime = Date.now();
        this.userAnswers.referrer = document.referrer;
        this.buttonResult.style.display = 'none';
        if (window.innerWidth <= 768) {
            this.userAnswers.device = 'M';
        }
        else {
            this.userAnswers.device = 'D';
        }
        if (this.userAnswers.device === 'M') {
            this.fetchUserId().then((id) => {
                this.userId = id;
            }).catch((error) => {
                console.error('Ошибка при получении userId:', error);
            });
        }
        this.userInput?.focus({ preventScroll: true });
        this.userInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.sendMessage();
            }
        });
        window.addEventListener('beforeunload', async (event) => {
            if (this.userAnswers.fio !== '' && !this.isChatFilled) {
                event.preventDefault(); // Предотвращаем закрытие страницы, пока данные не будут отправлены
                await this.sendDataToServer(this.userAnswers); // Дождитесь завершения запроса на сервер
            }
        });
        this.startChat();
        this.buttonChat?.addEventListener('click', this.sendMessage.bind(this));
        this.buttonResult?.addEventListener('click', this.getResult.bind(this));
        this.scrollButtons?.forEach((button) => {
            button.addEventListener('click', () => {
                this.userAnswers = {
                    fio: '',
                    age: '0',
                    profession: '',
                    experience: '0',
                    city: '',
                    monthly_income: '0',
                    telegram: '',
                    phone: '',
                    referrer: this.userAnswers.referrer,
                    visit_duration: this.userAnswers.visit_duration,
                    device: this.userAnswers.device,
                    want_event: 'Y',
                    hourly_income: '0'
                };
                this.currentQuestionIndex = 0;
                const section = document.getElementById('section-chat');
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                    this.userInput?.focus({ preventScroll: true });
                    setTimeout(() => {
                        this.questions[0] = 'Как вас зовут? Укажите фамилию и имя';
                        this.clearChat();
                        if (this.buttonChat) {
                            this.buttonChat.innerHTML = '<svg class="chat__button-svg" xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 33 33" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M28.9503 15.605C29.6912 15.9725 29.6912 17.0292 28.9503 17.3967L5.56937 28.9944C4.90465 29.3241 4.125 28.8405 4.125 28.0985V19.2488L16.5 16.4988L4.125 13.4661L4.125 4.9032C4.125 4.16121 4.90466 3.67764 5.56937 4.00736L28.9503 15.605Z" stroke="black" stroke-linejoin="round"/></svg>';
                            this.buttonChat.classList.add('chat__btn');
                            this.buttonChat.classList.add('btn');
                            this.buttonChat.classList.remove('btn-result');
                        }
                        if (this.buttonResult) {
                            this.buttonResult.style.display = 'none';
                        }
                        if (this.buttonChat) {
                            this.buttonChat.style.display = 'block';
                        }
                        this.userInput?.focus({ preventScroll: true });
                        const message = 'Привет! Пройдите небольшой опрос, чтобы мы узнали вас и лучше подготовились к мероприятию';
                        this.typeQuestion(message);
                        this.startChat();
                    }, 800);
                }
            });
        });
    }
    clearChat() {
        if (this.chatMessages) {
            while (this.chatMessages.firstChild) {
                this.chatMessages.removeChild(this.chatMessages.firstChild);
            }
        }
    }
    typeMessage(message, isUser) {
        if (this.chatMessages && this.userInput) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', isUser ? 'user' : 'bot');
            if (!isUser) {
                const proFestText = document.createElement('span');
                proFestText.classList.add('bot-name');
                proFestText.textContent = 'Pro-fest';
                messageElement.appendChild(proFestText);
            }
            const messageText = document.createElement('span');
            messageText.classList.add('bot-text');
            messageText.textContent = message;
            messageElement.appendChild(messageText);
            this.chatMessages.appendChild(messageElement);
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }
    typeQuestion(question) {
        this.typeMessage(question, false);
    }
    typeAnswer(answer) {
        this.typeMessage(answer, true);
    }
    startChat() {
        if (this.currentQuestionIndex < this.questions.length) {
            this.typeQuestion(this.questions[this.currentQuestionIndex]);
        }
        if (this.currentQuestionIndex === 6) {
            if (this.userInput) {
                this.userInput.placeholder = '@ или +7';
            }
        }
        else {
            if (this.userInput) {
                this.userInput.placeholder = 'Введите ответ на вопрос';
            }
        }
    }
    sendDataToServer(data, userId = null) {
        if (this.userAnswers.telegram.startsWith('+7')) {
            this.userAnswers.phone = this.userAnswers.telegram;
            this.userAnswers.telegram = '';
        }
        else if (!this.userAnswers.telegram.startsWith('@')) {
            this.userAnswers.telegram = '';
        }
        const timeOnSiteInSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        this.userAnswers.visit_duration = timeOnSiteInSeconds.toString(); // Добавляем время пребывания в данные пользователя
        const currentDomain = window.location.origin;
        const url = `${currentDomain}/submit_data/`;
        const jsonData = {
            id: userId,
            data: data
        };
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': 'csrftoken'
            }
        })
            .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then((responseData) => {
            // Обработка ответа от сервера, если необходимо
            console.log('Ответ сервера:', responseData);
        })
            .catch((error) => {
            // Обработка ошибки при отправке данных
            console.error('Произошла ошибка:', error);
        });
    }
    async fetchUserId() {
        try {
            const currentDomain = window.location.origin;
            const url = `${currentDomain}/submit_data/`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': 'csrftoken'
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseData = await response.json();
            const userId = responseData.id;
            console.log(userId + ' userId');
            return userId;
        }
        catch (error) {
            console.error('Ошибка при получении userId:', error);
            return null; // Вернуть null в случае ошибки
        }
    }
    sendMessage() {
        if (this.userInput) {
            const userMessage = this.userInput.value.trim();
            if (userMessage !== '') {
                this.handleUserMessage(userMessage);
                this.userInput.value = '';
                if (this.currentQuestionIndex === 6) {
                    if (this.userInput) {
                        this.userInput.placeholder = '@ или +7';
                    }
                }
                else {
                    if (this.userInput) {
                        this.userInput.placeholder = 'Введите ответ на вопрос';
                    }
                }
            }
        }
    }
    validateInput(key, value) {
        switch (key) {
            case 'fio':
                return !/\d/.test(value);
            case 'age':
                return /^\d+$/.test(value);
            case 'experience':
                return /^\d+$/.test(value);
            case 'telegram':
                return /^\+7\d{10}$/.test(value) || /^@[^\u0400-\u04FF]{2,}$/.test(value);
            case 'monthly_income':
                return /^\d+$/.test(value);
            default:
                return true;
        }
    }
    // Функция для определения схожести строк
    similarity(s1, s2) {
        const normalize = (string) => string.toLowerCase().replace(/[^a-zа-яё]/g, '');
        const str1 = normalize(s1);
        const str2 = normalize(s2);
        let longer = str1.length > str2.length ? str1 : str2;
        let shorter = str1.length > str2.length ? str2 : str1;
        const longerLength = longer.length;
        if (longerLength === 0) {
            return 1.0;
        }
        return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength.toString());
    }
    // Функция для вычисления расстояния Левенштейна (расстояния между строками)
    editDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
                }
            }
        }
        return matrix[str2.length][str1.length];
    }
    changePiter(city) {
        const userInput = city;
        // Нормализация ввода пользователя
        const normalizedUserInput = userInput.toLowerCase().trim();
        // Возможные варианты написания города Санкт-Петербург
        const validCityNames = [
            "питер",
            'Абаза', 'Абакан', 'Абдулино', 'Абзаково', 'Абинск', 'Абрау-Дюрсо', 'Авдеевка', 'Агидель', 'Агрыз', 'Адлер', 'Адыгейск', 'Азнакаево', 'Азов', 'Ак-Довурак', 'Аксай', 'Алагир', 'Алапаевск', 'Алатырь', 'Алдан', 'Алейск', 'Александров', 'Александровск', 'Александровск-Сахалинский', 'Алексеевка', 'Алексин', 'Алзамай', 'Алупка', 'Алушта', 'Алчевск', 'Альметьевск', 'Алёшки', 'Цюрупинск', 'Амвросиевка', 'Амурск', 'Анадырь', 'Анапа', 'Ангарск', 'Андреаполь', 'Анжеро-Судженск', 'Анива', 'Антрацит', 'Апатиты', 'Апрелевка', 'Апшеронск', 'Арамиль', 'Аргун', 'Ардатов', 'Ардон', 'Арзамас', 'Аркадак', 'Армавир', 'Армянск', 'Арсеньев', 'Арск', 'Артём', 'Артёмово', 'Артёмовск', 'Артёмовский', 'Архангельск', 'Архипо-Осиповка', 'Архыз', 'Асбест', 'Асино', 'Астрахань', 'Аткарск', 'Ахтубинск', 'Ачинск', 'Аша', 'Бабаево', 'Бабушкин', 'Бавлы', 'Багратионовск', 'Байкальск', 'Баймак', 'Бакал', 'Баксан', 'Балабаново', 'Балаково', 'Балахна', 'Балашиха', 'Балашов', 'Балей', 'Балтийск', 'Барабинск', 'Барнаул', 'Барыш', 'Батайск', 'Бахчисарай', 'Бежецк', 'Белая Калитва', 'Белая Холуница', 'Белгород', 'Белебей', 'Белинский', 'Белицкое', 'Белово', 'Белогорск', 'Белозерск', 'Белозёрское', 'Белокуриха', 'Беломорск', 'Белоозёрский', 'Белорецк', 'Белореченск', 'Белоусово', 'Белоярский', 'Белый', 'Белёв', 'Бердск', 'Бердянск', 'Береговое', 'Березники', 'Берислав', 'Берёзовский', 'Беслан', 'Бийск', 'Бикин', 'Билибино', 'Биробиджан', 'Бирск', 'Бирюсинск', 'Бирюч', 'Благовещенск', 'Благовещенская', 'Благодарный', 'Бобров', 'Богданович', 'Богородицк', 'Богородск', 'Боготол', 'Богучар', 'Бодайбо', 'Бокситогорск', 'Болгар', 'Бологое', 'Болотное', 'Болохово', 'Болхов', 'Большой Камень', 'Большой Утриш', 'Бор', 'Борзя', 'Борисоглебск', 'Боровичи', 'Боровск', 'Бородино', 'Братск', 'Бронницы', 'Брянка', 'Брянск', 'Бугульма', 'Бугуруслан', 'Будённовск', 'Бузулук', 'Буинск', 'Буй', 'Буйнакск', 'Бутурлиновка', 'Валдай', 'Валуйки', 'Васильевка', 'Вахрушево', 'Велиж', 'Великие Луки', 'Великий Новгород', 'Великий Устюг', 'Вельск', 'Венёв', 'Верещагино', 'Верея', 'Верхнеуральск', 'Верхний Тагил', 'Верхний Уфалей', 'Верхняя Пышма', 'Верхняя Салда', 'Верхняя Тура', 'Верхотурье', 'Верхоянск', 'Веселовка', 'Весьегонск', 'Ветлуга', 'Видное', 'Вилюйск', 'Вилючинск', 'Витязево', 'Вихоревка', 'Вичуга', 'Владивосток', 'Владикавказ', 'Владимир', 'Волгоград', 'Волгодонск', 'Волгореченск', 'Волжск', 'Волжский', 'Волноваха', 'Вологда', 'Володарск', 'Волоколамск', 'Волосово', 'Волхов', 'Волчанск', 'Вольнянск', 'Вольск', 'Воркута', 'Воронеж', 'Ворсма', 'Воскресенск', 'Воткинск', 'Всеволожск', 'Вуктыл', 'Выборг', 'Выкса', 'Высоковск', 'Высоцк', 'Вытегра', 'Вышний Волочёк', 'Вяземский', 'Вязники', 'Вязьма', 'Вятские Поляны', 'Гаврилов Посад', 'Гаврилов-Ям', 'Гагарин', 'Гаджиево', 'Гай', 'Галич', 'Гаспра', 'Гатчина', 'Гвардейск', 'Гдов', 'Геленджик', 'Геническ', 'Георгиевск', 'Глазов', 'Голая Пристань', 'Голицыно', 'Голубицкая', 'Горбатов', 'Горловка', 'Горно-Алтайск', 'Горнозаводск', 'Горняк', 'Городец', 'Городище', 'Городовиковск', 'Гороховец', 'Горское', 'Горячий Ключ', 'Грайворон', 'Гремячинск', 'Грозный', 'Грязи', 'Грязовец', 'Губаха', 'Губкин', 'Губкинский', 'Гудермес', 'Гуково', 'Гулькевичи', 'Гуляйполе', 'Гурзуф', 'Гурьевск', 'Гусев', 'Гусиноозёрск', 'Гусь-Хрустальный', 'Давлеканово', 'Дагестанские Огни', 'Дагомыс', 'Далматово', 'Дальнегорск', 'Дальнереченск', 'Данилов', 'Данков', 'Дебальцево', 'Дегтярск', 'Дедовск', 'Демидов', 'Дербент', 'Десногорск', 'Джанкой', 'Джемете', 'Джубга', 'Дзержинск', 'Дзержинский', 'Дивеево', 'Дивногорск', 'Дивноморское', 'Дигора', 'Димитров', 'Димитровград', 'Дмитриев', 'Дмитров', 'Дмитровск', 'Днепрорудное', 'Дно', 'Доброполье', 'Добрянка', 'Докучаевск', 'Долгопрудный', 'Должанская', 'Долинск', 'Домбай', 'Домодедово', 'Донецк', 'Донской', 'Дорогобуж', 'Дрезна', 'Дружковка', 'Дубна', 'Дубовка', 'Дудинка', 'Духовщина', 'Дюртюли', 'Дятьково', 'Евпатория', 'Егорьевск', 'Ейск', 'Екатеринбург', 'Елабуга', 'Елец', 'Елизово', 'Ельня', 'Еманжелинск', 'Емва', 'Енакиево', 'Енисейск', 'Ермолино', 'Ершов', 'Ессентуки', 'Ефремов', 'Ждановка', 'Железноводск', 'Железногорск', 'Железногорск-Илимский', 'Жердевка', 'Жигулёвск', 'Жиздра', 'Жирновск', 'Жуков', 'Жуковка', 'Жуковский', 'Завитинск', 'Заводоуковск', 'Заволжск', 'Заволжье', 'Задонск', 'Заинск', 'Закаменск', 'Заозёрный', 'Заозёрск', 'Западная Двина', 'Заполярный', 'Запорожье', 'Зарайск', 'Заречный', 'Заринск', 'Звенигово', 'Звенигород', 'Зверево', 'Зеленогорск', 'Зеленоградск', 'Зеленодольск', 'Зеленокумск', 'Зерноград', 'Зея', 'Зима', 'Зимогорье', 'Златоуст', 'Злынка', 'Змеиногорск', 'Знаменск', 'Золотое', 'Зоринск', 'Зубцов', 'Зугрэс', 'Зуевка', 'Ивангород', 'Иваново', 'Ивантеевка', 'Ивдель', 'Игарка', 'Ижевск', 'Избербаш', 'Изобильный', 'Иланский', 'Иловайск', 'Инза', 'Иннополис', 'Инсар', 'Инта', 'Ипатово', 'Ирбит', 'Иркутск', 'Ирмино', 'Исилькуль', 'Искитим', 'Истра', 'Ишим', 'Ишимбай', 'Йошкар-Ола', 'Кабардинка', 'Кадников', 'Казань', 'Калач', 'Калач-на-Дону', 'Калачинск', 'Калининград', 'Калининск', 'Калтан', 'Калуга', 'Калязин', 'Камбарка', 'Каменка', 'Каменка-Днепровская', 'Каменногорск', 'Каменск-Уральский', 'Каменск-Шахтинский', 'Камень-на-Оби', 'Камешково', 'Камызяк', 'Камышин', 'Камышлов', 'Канаш', 'Кандалакша', 'Канск', 'Карабаново', 'Карабаш', 'Карабулак', 'Карасук', 'Карачаевск', 'Карачев', 'Каргат', 'Каргополь', 'Карпинск', 'Карталы', 'Касимов', 'Касли', 'Каспийск', 'Катав-Ивановск', 'Катайск', 'Каховка', 'Качканар', 'Кашин', 'Кашира', 'Каякент', 'Кедровый', 'Кемерово', 'Кемь', 'Керчь', 'Кизел', 'Кизилюрт', 'Кизляр', 'Кимовск', 'Кимры', 'Кингисепп', 'Кинель', 'Кинешма', 'Киреевск', 'Киренск', 'Киржач', 'Кириллов', 'Кириши', 'Киров', 'Кировград', 'Кирово-Чепецк', 'Кировск', 'Кировское', 'Кирс', 'Кирсанов', 'Киселёвск', 'Кисловодск', 'Клин', 'Клинцы', 'Княгинино', 'Ковдор', 'Ковров', 'Ковылкино', 'Когалым', 'Кодинск', 'Козельск', 'Козловка', 'Козьмодемьянск', 'Коктебель', 'Кола', 'Кологрив', 'Коломна', 'Колпашево', 'Кольчугино', 'Коммунар', 'Комсомольск', 'Комсомольск-на-Амуре', 'Комсомольское', 'Конаково', 'Кондопога', 'Кондрово', 'Константиновка', 'Константиновск', 'Копейск', 'Кораблино', 'Кореновск', 'Коркино', 'Королёв', 'Короча', 'Корсаков', 'Коряжма', 'Костерёво', 'Костомукша', 'Кострома', 'Котельники', 'Котельниково', 'Котельнич', 'Котлас', 'Котово', 'Котовск', 'Кохма', 'Краматорск', 'Красавино', 'Красная Поляна', 'Красноармейск', 'Красновишерск', 'Красногоровка', 'Красногорск', 'Краснодар', 'Краснодон', 'Краснозаводск', 'Краснознаменск', 'Краснокаменск', 'Краснокамск', 'Красноперекопск', 'Краснослободск', 'Краснотурьинск', 'Красноуральск', 'Красноуфимск', 'Красноярск', 'Красный Кут', 'Красный Лиман', 'Красный Луч', 'Красный Сулин', 'Красный Холм', 'Кременная', 'Кремёнки', 'Кронштадт', 'Кропоткин', 'Крымск', 'Кстово', 'Кубинка', 'Кувандык', 'Кувшиново', 'Кудрово', 'Кудымкар', 'Кузнецк', 'Куйбышев', 'Кукмор', 'Кулебаки', 'Кумертау', 'Кунгур', 'Купино', 'Курахово', 'Курган', 'Курганинск', 'Курильск', 'Курлово', 'Куровское', 'Курск', 'Куртамыш', 'Курчалой', 'Курчатов', 'Куса', 'Кучугуры', 'Кушва', 'Кызыл', 'Кыштым', 'Кяхта', 'Лабинск', 'Лабытнанги', 'Лагань', 'Ладушкин', 'Лазаревское', 'Лаишево', 'Лакинск', 'Лангепас', 'Лахденпохья', 'Лебедянь', 'Лениногорск', 'Ленинск', 'Ленинск-Кузнецкий', 'Ленск', 'Лермонтов', 'Лермонтово', 'Лесной', 'Лесозаводск', 'Лесосибирск', 'Ливны', 'Ликино-Дулёво', 'Липецк', 'Липки', 'Лисичанск', 'Лиски', 'Лихославль', 'Лобня', 'Лодейное Поле', 'Лоо', 'Лосино-Петровский', 'Луга', 'Луганск', 'Луза', 'Лукоянов', 'Лутугино', 'Луховицы', 'Лысково', 'Лысьва', 'Лыткарино', 'Льгов', 'Любань', 'Люберцы', 'Любим', 'Людиново', 'Лянтор', 'Магадан', 'Магас', 'Магнитогорск', 'Майкоп', 'Майский', 'Макаров', 'Макарьев', 'Макеевка', 'Макушино', 'Малая Вишера', 'Малгобек', 'Малмыж', 'Малоархангельск', 'Малоярославец', 'Мамадыш', 'Мамоново', 'Манжерок', 'Мантурово', 'Мариинск', 'Мариинский Посад', 'Мариуполь', 'Маркс', 'Марьинка', 'Махачкала', 'Мацеста', 'Мглин', 'Мегион', 'Медвежьегорск', 'Медногорск', 'Медынь', 'Межводное', 'Межгорье', 'Междуреченск', 'Мезень', 'Мезмай', 'Меленки', 'Мелеуз', 'Мелитополь', 'Менделеевск', 'Мензелинск', 'Мещовск', 'Миасс', 'Микунь', 'Миллерово', 'Минеральные Воды', 'Минусинск', 'Миньяр', 'Мирный', 'Мисхор', 'Миусинск', 'Михайлов', 'Михайловка', 'Михайловск', 'Мичуринск', 'Могоча', 'Можайск', 'Можга', 'Моздок', 'Молодогвардейск', 'Молочанск', 'Мончегорск', 'Морозовск', 'Морское', 'Моршанск', 'Мосальск', 'Москва', 'Моспино', 'Муравленко', 'Мураши', 'Мурино', 'Мурманск', 'Муром', 'Мценск', 'Мыски', 'Мысовое', 'Мытищи', 'Мышкин', 'Набережные Челны', 'Навашино', 'Наволоки', 'Надым', 'Назарово', 'Назрань', 'Называевск', 'Нальчик', 'Нариманов', 'Наро-Фоминск', 'Нарткала', 'Нарьян-Мар', 'Находка', 'Невель', 'Невельск', 'Невинномысск', 'Невьянск', 'Нелидово', 'Неман', 'Нерехта', 'Нерчинск', 'Нерюнгри', 'Нестеров', 'Нефтегорск', 'Нефтекамск', 'Нефтекумск', 'Нефтеюганск', 'Нея', 'Нижневартовск', 'Нижнекамск', 'Нижнеудинск', 'Нижние Серги', 'Нижний Ломов', 'Нижний Новгород', 'Нижний Тагил', 'Нижняя Салда', 'Нижняя Тура', 'Николаевка', 'Николаевск', 'Николаевск-на-Амуре', 'Никольск', 'Никольское', 'Новая Анапа', 'Новая Евпатория', 'Новая Каховка', 'Новая Ладога', 'Новая Ляля', 'Новоазовск', 'Новоалександровск', 'Новоалтайск', 'Новоаннинский', 'Нововоронеж', 'Новогродовка', 'Новодвинск', 'Новодружеск', 'Новозыбков', 'Новокубанск', 'Новокузнецк', 'Новокуйбышевск', 'Новомихайловский', 'Новомичуринск', 'Новомосковск', 'Новопавловск', 'Новоржев', 'Новороссийск', 'Новосибирск', 'Новосиль', 'Новосокольники', 'Новотроицк', 'Новоузенск', 'Новоульяновск', 'Новоуральск', 'Новохопёрск', 'Новочебоксарск', 'Новочеркасск', 'Новошахтинск', 'Новый Оскол', 'Новый Свет', 'Новый Уренгой', 'Ногинск', 'Нолинск', 'Норильск', 'Ноябрьск', 'Нурлат', 'Нытва', 'Нюрба', 'Нягань', 'Нязепетровск', 'Няндома', 'Облучье', 'Обнинск', 'Обоянь', 'Обь', 'Одинцово', 'Озёрск', 'Озёры', 'Октябрьск', 'Октябрьский', 'Окуловка', 'Оленевка', 'Оленегорск', 'Олонец', 'Ольгинка', 'Олёкминск', 'Омск', 'Омутнинск', 'Онега', 'Опочка', 'Орджоникидзе', 'Оренбург', 'Орехов', 'Орехово-Зуево', 'Орлов', 'Орск', 'Орёл', 'Оса', 'Осинники', 'Осташков', 'Остров', 'Островной', 'Острогожск', 'Отрадное', 'Отрадный', 'Оха', 'Оханск', 'Очёр', 'Павлово', 'Павловск', 'Павловский Посад', 'Палех', 'Палласовка', 'Партенит', 'Партизанск', 'Певек', 'Пенза', 'Первомайск', 'Первоуральск', 'Перевальск', 'Перевоз', 'Пересвет', 'Переславль-Залесский', 'Пересыпь', 'Пермь', 'Пестово', 'Петергоф', 'Петров Вал', 'Петровск', 'Петровск-Забайкальский', 'Петровское', 'Петрозаводск', 'Петропавловск-Камчатский', 'Петухово', 'Петушки', 'Печора', 'Печоры', 'Пикалёво', 'Пионерский', 'Питкяранта', 'Плавск', 'Пласт', 'Плёс', 'Поворино', 'Подольск', 'Подпорожье', 'Покачи', 'Покров', 'Покровск', 'Полевской', 'Полесск', 'Пологи', 'Полысаево', 'Полярные Зори', 'Полярный', 'Попасная', 'Поповка', 'Поронайск', 'Порхов', 'Похвистнево', 'Почеп', 'Починок', 'Пошехонье', 'Правдинск', 'Приволжск', 'Приволье', 'Приморск', 'Приморский', 'Приморско-Ахтарск', 'Приозерск', 'Прокопьевск', 'Пролетарск', 'Протвино', 'Прохладный', 'Псков', 'Пугачёв', 'Пудож', 'Пустошка', 'Пучеж', 'Пушкино', 'Пущино', 'Пыталово', 'Пыть-Ях', 'Пятигорск', 'Радужный', 'Райчихинск', 'Раменское', 'Рассказово', 'Ревда', 'Реж', 'Реутов', 'Ржев', 'Ровеньки', 'Родинское', 'Родники', 'Рославль', 'Россошь', 'Ростов', 'Ростов Великий', 'Ростов-на-Дону', 'Рошаль', 'Ртищево', 'Рубежное', 'Рубцовск', 'Рудня', 'Руза', 'Рузаевка', 'Рыбачье', 'Рыбинск', 'Рыбное', 'Рыльск', 'Ряжск', 'Рязань', 'Саки', 'Салават', 'Салаир', 'Салехард', 'Сальск', 'Самара', 'Санкт-Петербург', 'Саранск', 'Сарапул', 'Саратов', 'Саров', 'Сасово', 'Сатка', 'Сафоново', 'Саяногорск', 'Саянск', 'Сватово', 'Свердловск', 'Светлогорск', 'Светлоград', 'Светлодарск', 'Светлый', 'Светогорск', 'Свирск', 'Свияжск', 'Свободный', 'Святогорск', 'Себеж', 'Севастополь', 'Северо-Курильск', 'Северобайкальск', 'Северодвинск', 'Северодонецк', 'Североморск', 'Североуральск', 'Северск', 'Севск', 'Сегежа', 'Селидово', 'Сельцо', 'Семикаракорск', 'Семилуки', 'Семёнов', 'Сенгилей', 'Серафимович', 'Сергач', 'Сергиев Посад', 'Сердобск', 'Серов', 'Серпухов', 'Сертолово', 'Сибай', 'Сим', 'Симеиз', 'Симферополь', 'Скадовск', 'Сковородино', 'Скопин', 'Славгород', 'Славск', 'Славянск', 'Славянск-на-Кубани', 'Сланцы', 'Слободской', 'Слюдянка', 'Смоленск', 'Снежинск', 'Снежногорск', 'Снежное', 'Снигирёвка', 'Собинка', 'Советск', 'Советская Гавань', 'Советский', 'Сокол', 'Соледар', 'Солигалич', 'Соликамск', 'Солнечногорск', 'Солнечногорское', 'Соль-Илецк', 'Сольвычегодск', 'Сольцы', 'Сорочинск', 'Сорск', 'Сортавала', 'Сосенский', 'Сосновка', 'Сосновоборск', 'Сосновый Бор', 'Сосногорск', 'Сочи', 'Спас-Деменск', 'Спас-Клепики', 'Спасск', 'Спасск-Дальний', 'Спасск-Рязанский', 'Среднеколымск', 'Среднеуральск', 'Сретенск', 'Ставрополь', 'Старая Купавна', 'Старая Ладога', 'Старая Русса', 'Старица', 'Старобельск', 'Стародуб', 'Старый Крым', 'Старый Оскол', 'Стаханов', 'Стерлитамак', 'Стрежевой', 'Строитель', 'Струнино', 'Ступино', 'Суворов', 'Судак', 'Суджа', 'Судогда', 'Суздаль', 'Сукко', 'Сунжа', 'Суоярви', 'Сураж', 'Сургут', 'Суровикино', 'Сурск', 'Сусуман', 'Сухиничи', 'Суходольск', 'Сухой Лог', 'Счастье', 'Сызрань', 'Сыктывкар', 'Сысерть', 'Сычёвка', 'Сясьстрой', 'Тавда', 'Таврийск', 'Таганрог', 'Тайга', 'Тайшет', 'Талдом', 'Талица', 'Тамань', 'Тамбов', 'Тара', 'Тарко-Сале', 'Таруса', 'Татарск', 'Таштагол', 'Тверь', 'Теберда', 'Тейково', 'Темников', 'Темрюк', 'Терек', 'Тетюши', 'Тимашёвск', 'Тихвин', 'Тихорецк', 'Тобольск', 'Тогучин', 'Токмак', 'Тольятти', 'Томари', 'Томмот', 'Томск', 'Топки', 'Торез', 'Торжок', 'Торопец', 'Тосно', 'Тотьма', 'Троицк', 'Трубчевск', 'Трёхгорный', 'Туапсе', 'Туймазы', 'Тула', 'Тулун', 'Туран', 'Туринск', 'Тутаев', 'Тында', 'Тырныауз', 'Тюкалинск', 'Тюмень', 'Уварово', 'Углегорск', 'Угледар', 'Углич', 'Удачный', 'Удомля', 'Ужур', 'Узловая', 'Украинск', 'Улан-Удэ', 'Ульяновск', 'Унеча', 'Урай', 'Урень', 'Уржум', 'Урус-Мартан', 'Урюпинск', 'Усинск', 'Усмань', 'Усолье', 'Усолье-Сибирское', 'Уссурийск', 'Усть-Джегута', 'Усть-Илимск', 'Усть-Катав', 'Усть-Кут', 'Усть-Лабинск', 'Устюжна', 'Уфа', 'Ухта', 'Учалы', 'Уяр', 'Фатеж', 'Феодосия', 'Фокино', 'Форос', 'Фролово', 'Фрязино', 'Фурманов', 'Хабаровск', 'Хадыженск', 'Ханты-Мансийск', 'Харабали', 'Харовск', 'Харцызск', 'Хасавюрт', 'Хвалынск', 'Херсон', 'Хилок', 'Химки', 'Холм', 'Холмск', 'Хоста', 'Хотьково', 'Царское село', 'Цивильск', 'Цимлянск', 'Циолковский', 'Чадан', 'Чайковский', 'Чапаевск', 'Чаплыгин', 'Часов Яр', 'Чебаркуль', 'Чебоксары', 'Чегем', 'Чекалин', 'Челябинск', 'Червонопартизанск', 'Чердынь', 'Черемхово', 'Черепаново', 'Череповец', 'Черкесск', 'Черноголовка', 'Черногорск', 'Черноморское', 'Чернушка', 'Черняховск', 'Чехов', 'Чистополь', 'Чита', 'Чкаловск', 'Чудово', 'Чулым', 'Чусовой', 'Чухлома', 'Чёрмоз', 'Шагонар', 'Шадринск', 'Шали', 'Шарыпово', 'Шарья', 'Шатура', 'Шахты', 'Шахтёрск', 'Шахунья', 'Шацк', 'Шебекино', 'Шелехов', 'Шенкурск', 'Шерегеш', 'Шилка', 'Шимановск', 'Шиханы', 'Шлиссельбург', 'Штормовое', 'Шумерля', 'Шумиха', 'Шуя', 'Щелкино', 'Щигры', 'Щучье', 'Щёкино', 'Щёлкино', 'Щёлково', 'Электрогорск', 'Электросталь', 'Электроугли', 'Элиста', 'Энгельс', 'Энергодар', 'Эртиль', 'Югорск', 'Южа', 'Южно-Сахалинск', 'Южно-Сухокумск', 'Южноуральск', 'Юнокоммунаровск', 'Юрга', 'Юрьев-Польский', 'Юрьевец', 'Юрюзань', 'Юхнов', 'Ядрин', 'Якутск', 'Ялта', 'Ялуторовск', 'Янаул', 'Яранск', 'Яровое', 'Ярославль', 'Ярцево', 'Ясиноватая', 'Ясногорск', 'Ясный', 'Яхрома'
        ];
        // Поиск наиболее похожего варианта
        let bestMatch = "";
        let bestSimilarity = 0;
        validCityNames.forEach(city => {
            const similarityValue = this.similarity(normalizedUserInput, city.toLocaleLowerCase());
            if (similarityValue > bestSimilarity) {
                bestSimilarity = similarityValue;
                bestMatch = city.toLocaleLowerCase();
            }
        });
        if (bestMatch && bestSimilarity > 0.5) {
            console.log(`Введенный город похож на ${bestMatch}.`);
            // Отправка данных на сервер для найденного города
            // ...
            this.userAnswers.city = bestMatch;
            if (this.userAnswers.city === 'санкт-петербург') {
                this.userAnswers.city = 'питер';
            }
        }
    }
    handleUserMessage(message) {
        const currentQuestionKey = Object.keys(this.userAnswers)[this.currentQuestionIndex];
        if (this.validateInput(currentQuestionKey, message)) {
            if (currentQuestionKey !== 'phone') {
                this.userAnswers[currentQuestionKey] = message;
            }
            if (currentQuestionKey === 'city') {
                this.userAnswers.city = message.toLocaleLowerCase();
                this.changePiter(message);
            }
            if (currentQuestionKey === 'telegram' && this.userAnswers.want_event === 'Y') {
                this.typeAnswer(message);
                const question = ' Вы успешно записаны на PRO-FEST! Отправим программу фестиваля на указанный вами номер. А еще мы рассчитали стоимость часа вашей работы. Скорее смотрите результат ниже и забирайте подарочные стикеры для общения с коллегами!';
                this.typeQuestion(question);
                if (this.userAnswers.device === 'M') {
                    this.sendDataToServer(this.userAnswers, this.userId);
                }
                this.handleFinalAnswer(message);
            }
            else if (currentQuestionKey === 'telegram' && this.questions.length - 1) {
                this.currentQuestionIndex++;
                this.typeAnswer(message);
                if (this.userAnswers.device === 'M') {
                    this.sendDataToServer(this.userAnswers, this.userId);
                }
                this.startChat();
                this.userInput?.focus({ preventScroll: true });
            }
            else if (this.currentQuestionIndex < this.questions.length - 1) {
                this.currentQuestionIndex++;
                this.typeAnswer(message);
                if (this.userAnswers.device === 'M') {
                    this.sendDataToServer(this.userAnswers, this.userId);
                }
                this.startChat();
                this.userInput?.focus({ preventScroll: true });
            }
            else {
                if (currentQuestionKey !== 'phone') {
                    this.userAnswers[currentQuestionKey] = message;
                }
                this.handleFinalAnswer(message);
            }
        }
        else {
            this.typeQuestion('Пожалуйста, введите корректные данные');
        }
    }
    handleFinalAnswer(answer) {
        if (this.userAnswers.want_event === 'N') {
            if (answer.toLowerCase() === 'да') {
                this.userAnswers.want_event = 'Y';
                const message = ' Вы успешно записаны на PRO-FEST! Отправим программу фестиваля на указанный вами номер. А еще мы рассчитали стоимость часа вашей работы. Скорее смотрите результат ниже и забирайте подарочные стикеры для общения с коллегами!';
                this.typeAnswer(answer);
                this.typeQuestion(message);
            }
            else {
                this.userAnswers.want_event = 'N';
                const message = 'Мы рассчитали стоимость часа вашей работы. Скорее смотрите результат ниже и забирайте подарочные стикеры для общения с коллегами!';
                this.typeAnswer(answer);
                this.typeQuestion(message);
            }
        }
        if (this.buttonChat && this.buttonResult) {
            this.buttonChat.style.display = 'none';
            this.buttonResult.style.display = 'block';
        }
        const hourlyRate = (parseInt(this.userAnswers.monthly_income) / (22 * 8)).toFixed(0);
        this.userAnswers.hourly_income = hourlyRate.toString();
        this.sendDataToServer(this.userAnswers, this.userId);
    }
    getResult() {
        this.isChatFilled = true;
        const horlyRate = parseInt(this.userAnswers.hourly_income, 10);
        const repost = document.getElementById('ya-share2');
        if (horlyRate <= 500) {
            if (this.popup && this.popupRate && this.popupDescription && this.popupImg && this.popupTitle) {
                this.popupRate.innerHTML = this.userAnswers.hourly_income + ' р/час';
                this.popupDescription.innerHTML = `Вы стоите на отметке ${this.userAnswers.hourly_income} рублей в час, а это значит, что перед вами бесконечное поле возможностей! Как насчет участия в экспертной сессии с нашими спикерами? Только представьте, сколько точек роста и путей развития ожидает вас?! На карьерной дегустации вы можете пообщаться с коучем, который направит вас и поможет с разбором резюме. Дерзайте!`;
                this.popupImg.src = '../static/img/result-1.png';
                this.popupTitle.textContent = 'Достигатор обыкновенный';
                repost?.setAttribute('data-image', this.popupImg.src);
                repost?.setAttribute('data-title', 'Вы — Достигатор обыкновенный');
                repost?.setAttribute('data-description', 'Достигай-не достигай, а кофе по расписанию, в конце концов зря я что ли выбирал свободный график? Хочу работаю, хочу думаю о своих успехах, я ведь и так красавчик.');
            }
        }
        else if (horlyRate >= 501 && horlyRate <= 2000) {
            if (this.popup && this.popupRate && this.popupDescription && this.popupImg && this.popupTitle) {
                this.popupRate.innerHTML = this.userAnswers.hourly_income + ' р/час';
                this.popupDescription.innerHTML = `Ваша отметка на сегодня - ${this.userAnswers.hourly_income} в час, не замедляя шага, двигайтесь дальше. Чтобы свернуть на новом карьерном витке, послушайте лекции о переквалификации и востребованных профессиях на бизнес-завтраке или пообщайтесь с коучем. Но если вы хотите дойти до впечатляющих цифр, отправляйтесь на экспертные сессии феста.`;
                this.popupImg.src = '../static/img/result-2.png';
                this.popupTitle.textContent = 'Успехмейкер выдающийся';
                repost?.setAttribute('data-image', this.popupImg.src);
                repost?.setAttribute('data-title', 'Вы — Успехмейкер выдающийся');
                repost?.setAttribute('data-description', 'Я в порядке, ребят! Я все успею, ребят! Ещё есть день, ещё есть ночь, а ночью вообще никто мешать не будет! А ещё я могу за вас презенташку доделать!');
            }
        }
        else {
            if (this.popup && this.popupRate && this.popupDescription && this.popupImg && this.popupTitle) {
                this.popupRate.innerHTML = this.userAnswers.hourly_income + ' р/час';
                this.popupDescription.innerHTML = `Вы многое преодолели, и не зря ваш путь остановился на отметке ${this.userAnswers.hourly_income} рублей в час! Сколько энергии и сил вы затратили на блуждания в профессиональном лабиринте возможностей, может быть, пора расслабиться и посетить карьерный стендап? А как насчет экспертных сессий о work/life balance, выгорании и новых точках роста? Ждем вас!`;
                this.popupImg.src = '../static/img/result-3.png';
                this.popupTitle.textContent = 'Маниманьяк';
                repost?.setAttribute('data-image', this.popupImg.src);
                repost?.setAttribute('data-title', 'Вы — Маниманьяк');
                repost?.setAttribute('data-description', 'Череда черных и белых полос должна конвертироваться в зелёный свет на пути к бесконечному количеству возможностей в моем кошельке. Нет-нет, я не устал, я твердо стою на ногах как хэдлайнер рок-фестиваля!');
            }
        }
        // const element = document.getElementById('popup');
        // if (element) {
        //   html2canvas(element).then((canvas: HTMLCanvasElement) => {
        //     const img = new Image();
        //     const imgUrl = canvas.toDataURL();
        //     console.log('imgUrl ' + imgUrl);
        //     repost?.setAttribute('data-image', imgUrl);
        //   });
        // }
        if (this.showPopup) {
            this.showPopup();
        }
    }
    overlay = document.getElementById('overlay');
    showPopup() {
        if (this.popup) {
            this.overlay?.classList.add('active');
            this.popup.classList.add('show');
            const hourlyRate = this.popup.querySelector('#popup-hourly-rate');
            if (hourlyRate) {
                hourlyRate.textContent = this.userAnswers.hourly_income + ' р/час';
            }
            this.popupBtn?.addEventListener('click', () => {
                this.closePopup();
            });
        }
    }
    closePopup() {
        this.overlay?.classList.remove('active');
        if (this.popup) {
            this.popup.classList.remove('show');
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});
