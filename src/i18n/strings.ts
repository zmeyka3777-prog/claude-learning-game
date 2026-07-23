/**
 * Словарь интерфейсных строк «AI Экспедиции».
 * Ключи — семантические (напр. 'map.title.pre', 'lesson.continue').
 * ВСЕ видимые строки интерфейса живут здесь; в компонентах — только t('...').
 * Плейсхолдеры вида {name} подставляются через useT()/translate().
 *
 * Термины Claude — официальные английские (Claude Code, Skills, MCP, Artifacts…).
 * Кавычки внутри шаблонов локализованы: « » для ru, “ ” для en.
 */
import type { LangCode } from '../engine/types';

const ru: Record<string, string> = {
  // --- Бренд / топбар ---
  'brand.academy': 'AI Экспедиция',
  'brand.pre': 'AI',
  'brand.accent': 'Экспедиция',
  'brand.subtitle':
    'Интерактивная обучающая игра по Claude: чат, Claude Code, скиллы, плагины, MCP и API — от новичка до профи',
  'topbar.toMap': 'На карту миров',
  'topbar.xp': 'Опыт',
  'topbar.library': 'Библиотека',
  'topbar.profile': 'Профиль',
  'lang.switch': 'Язык интерфейса',

  // --- Общее ---
  'common.check': 'Проверить',
  'common.reset': 'Сбросить',
  'common.correct': 'Верно!',
  'common.copied': 'Скопировано',
  'common.continue': 'Продолжить',
  'common.toMap': 'На карту миров',
  'nav.toGalaxy': 'На карту галактики',

  // --- Загрузчик ---
  'loader.sector': 'Загрузка сектора…',

  // --- Стрик ---
  'streak.active': 'Стрик: {days} дн. подряд',
  'streak.start': 'Начни стрик — пройди урок сегодня',

  // --- Треки ---
  'track.novice.title': 'С нуля',
  'track.novice.desc': 'Никогда не пользовался ИИ — начнём с самых основ',
  'track.user.title': 'Пользователь',
  'track.user.desc': 'Пользуюсь чатом, хочу открыть всё остальное',
  'track.developer.title': 'Разработчик',
  'track.developer.desc': 'Пишу код — хочу Claude Code, MCP и API',
  'track.business.title': 'Бизнес',
  'track.business.desc': 'Хочу автоматизировать рабочие задачи',

  // --- Онбординг ---
  'onb.lang.title': 'Выбери язык интерфейса',
  'onb.lang.subtitle': 'Его можно сменить в любой момент в профиле или в шапке.',
  'onb.welcome.subtitle': 'Изучи все возможности Claude — играя',
  'onb.welcome.start': 'Начать экспедицию',
  'onb.tracks.titlePre': 'Выбери свой',
  'onb.tracks.titleAccent': 'трек',
  'onb.tracks.subtitle':
    'От трека зависит рекомендованный маршрут по секторам галактики. Сменить его можно в любой момент в профиле.',
  'onb.placement.titlePre': 'Уже пользуешься',
  'onb.placement.subtitle':
    'Пройди входной тест (2 минуты) — 16 вопросов покажут, какие сектора ты уже знаешь, а какие стали слепыми зонами. Знакомые миры можно зачесть испытаниями боссов.',
  'onb.placement.take': 'Пройти тест',
  'onb.placement.skip': 'Пропустить',

  // --- Приветственный тост ---
  'toast.welcome.title': 'Добро пожаловать в экспедицию, исследователь!',
  'toast.welcome.body':
    'Трек {emoji} «{title}» выбран — рекомендованные сектора отмечены на карте.',

  // --- Карта миров ---
  'map.title.pre': 'Карта',
  'map.title.accent': 'галактики',
  'map.subtitle.start': 'Твоя экспедиция начинается. Выбери первый урок сектора 1!',
  'map.subtitle.progress': 'Пройдено уроков: {count}. Продолжай экспедицию!',
  'map.review.body': 'Короткая сессия закрепит пройденное. +25 XP за повторение.',
  'map.nextSectors': 'Следующие сектора галактики',
  'map.comingSoon': 'Скоро',
  'map.sector': 'Сектор {order}',
  'map.library.titleSuffix': ': готовые скиллы, плагины и MCP',
  'map.library.body': 'Проверенные расширения с командами установки — прокачай свой арсенал.',
  'map.whatsnew.pre': 'Что',
  'map.whatsnew.accent': 'нового',

  // --- Повторение (общее) ---
  'review.daily.pre': 'Повторение',
  'review.daily.accent': 'дня',
  'review.due.one': '{count} урок ждёт',
  'review.due.few': '{count} урока ждут',
  'review.due.many': '{count} уроков ждут',

  // --- Карта мира (WorldMap) ---
  'worldmap.recommended': 'Рекомендовано',
  'worldmap.passed': 'Мир зачтён',
  'worldmap.bossChallenge': 'Испытание босса',
  'worldmap.bossChallenge.title': 'Пройди босса без теории и зачти весь мир',
  'worldmap.challengeSoon': 'Испытание — скоро',
  'worldmap.bossSoon.title': 'Босс-урок мира ещё пишется',

  // --- Узел урока ---
  'node.loading': 'загрузка контента',
  'node.passed': 'зачтено испытанием',
  'node.aria.boss': 'Босс: ',
  'node.aria.locked': ' (заблокирован)',

  // --- Экран урока ---
  'lesson.back.aria': 'Назад на карту',
  'lesson.challengeInfo': 'Испытание босса: без теории, максимум 1 ошибка',
  'lesson.min': '{n} мин',
  'lesson.taskOf': 'Задание {n} из {total}',
  'lesson.toTasks': 'К заданиям',
  'lesson.finish': 'Завершить',
  'lesson.finishChallenge': 'Завершить испытание',
  'lesson.finishLesson': 'Завершить урок',
  'lesson.readOriginal': 'Читать оригинал',
  'lesson.verified': 'Проверено: {date}',
  'lesson.foundBug': '⚑ Нашёл ошибку в уроке?',
  'lesson.orEmail': 'или напиши на почту',
  'lesson.notWritten.title': 'Контент загружается',
  'lesson.notWritten.body':
    'Этот урок ещё пишется. Экспедиция скоро продолжится — загляни позже!',

  // --- Испытание босса: провал/успех ---
  'challenge.fail.title': 'Испытание не пройдено',
  'challenge.fail.body':
    'Больше одной ошибки — босс сектора «{world}» устоял. Ничего страшного: попробуй ещё раз или пройди уроки мира по порядку.',
  'challenge.retry': 'Попробовать ещё раз',
  'challenge.study': 'Учиться по порядку',
  'challenge.success.title': 'Испытание пройдено!',
  'challenge.success.body':
    'Мир «{world}» зачтён. Уроки мира остаются открытыми — вернись за карточками функций и дополнительным XP.',
  'challenge.alreadyPassed': 'Мир уже был зачтён',

  // --- Оверлей завершения урока ---
  'complete.boss': 'Босс повержен!',
  'complete.lesson': 'Экспедиция завершена!',
  'complete.alreadyDone': 'Урок уже был пройден',
  'complete.xp': '+{n} XP',
  'complete.streak': '🔥 Стрик: {n} дн.',
  'complete.newCard': 'Новая карточка в альбоме',
  'complete.getCertificate': 'Получить сертификат',
  'complete.next': 'Дальше',

  // --- Бейдж ---
  'badge.new': 'Новый бейдж!',

  // --- Квиз ---
  'quiz.multiHint': 'Выбери несколько вариантов и нажми «Проверить».',
  'quiz.showHint': 'Показать подсказку',

  // --- Собери промпт ---
  'build.hint': 'Нажимай на блоки в правильном порядке. Осторожно: среди них есть лишние.',
  'build.placeholder': 'Твой промпт появится здесь',
  'build.wrong': 'Пока не то. Проверь порядок блоков — и не попался ли лишний.',
  'build.solved': 'Промпт собран!',

  // --- Найди ошибку ---
  'findbug.hint': 'Нажми на строку, в которой спряталась ошибка.',
  'findbug.wrong': 'В этой строке всё в порядке. Ищи дальше!',
  'findbug.solved': 'Ошибка найдена!',

  // --- Чат-симулятор ---
  'chat.header.sim': 'симулятор',
  'chat.empty': 'Напиши сообщение — «Claude» ответит',
  'chat.placeholder': 'Напиши Claude…',
  'chat.send.aria': 'Отправить',
  'chat.solved': 'Диалог удался!',

  // --- Терминал-симулятор ---
  'term.err': 'команда не подошла — попробуй ещё раз',
  'term.input.aria': 'Ввод команды',
  'term.solved': 'Команды выполнены!',

  // --- Реальная миссия ---
  'mission.title': 'Реальная миссия',
  'mission.subtitle': 'Задание в настоящем Claude — самый ценный опыт и бонусный XP.',
  'mission.checkYourself': 'Проверь себя:',
  'mission.mentor.toggle': '🧑‍🚀 Хочешь настоящую проверку?',
  'mission.mentor.body':
    'Установи скилл «Наставник экспедиции» (раздел Библиотека) — и настоящий Claude проверит твою миссию по этому чек-листу.',
  'mission.mentor.copy': 'Скопировать миссию для наставника',
  'mission.copyBlock.checklist': 'Чек-лист:',
  'mission.copyBlock.footer': 'Проверь миссию из AI Экспедиции по этому чек-листу',
  'mission.done': 'Выполнил',
  'mission.done.title': 'Миссия выполнена! +{n} бонусного XP',
  'mission.done.body': 'Реальная практика — лучший способ закрепить навык. Так держать!',

  // --- Теория ---
  'callout.tip': '💡 Совет',
  'callout.warning': '⚠️ Важно',
  'callout.docs': '📖 Из документации',
  'code.copy': 'Копировать',
  'code.copied': 'Скопировано',
  'example.bad': 'Плохо',
  'example.good': 'Хорошо',

  // --- Карточка функции ---
  'rarity.common': 'Обычная',
  'rarity.rare': 'Редкая',
  'rarity.epic': 'Эпическая',
  'rarity.legendary': 'Легендарная',
  'card.locked.desc': 'Пройди урок, чтобы открыть эту карточку.',

  // --- Профиль ---
  'profile.title.pre': 'Профиль',
  'profile.title.accent': 'исследователя',
  'profile.level': 'Уровень {n}',
  'profile.xpTotal': '{n} XP всего',
  'profile.daysInARow': 'дней подряд',
  'profile.record': 'рекорд: {n}',
  'profile.lessonsCompleted': 'Пройдено уроков: {n}',
  'profile.toNextLevel': 'До уровня {n}',
  'profile.track.selected': 'Трек: «{track}»',
  'profile.track.none': 'Трек: не выбран',
  'profile.track.noneDesc': 'Выбери трек — и на карте появятся рекомендованные сектора',
  'profile.certificates': 'Сертификаты',
  'profile.certificates.title': 'Именные сертификаты за пройденные сектора',
  'profile.placement': 'Входной тест',
  'profile.placement.title': '16 вопросов — покажут, какие миры можно зачесть испытанием',
  'profile.changeTrack': 'Сменить трек',
  'profile.badges': 'Бейджи',
  'profile.album': 'Альбом карточек',
  'profile.album.desc': 'Каждая карточка — освоенная функция Claude. Собери весь альбом!',

  // --- Резервная копия прогресса ---
  'backup.title': 'Прогресс и резервная копия',
  'backup.body':
    'Прогресс хранится в этом браузере на этом устройстве. Не заходи в режиме инкогнито — там он стирается. Чтобы не потерять прогресс или перенести его на другое устройство, сохрани резервную копию.',
  'backup.download': 'Скачать копию',
  'backup.restore': 'Восстановить из копии',
  'backup.downloaded': 'Копия сохранена',
  'backup.restored': 'Прогресс восстановлен',
  'backup.error': 'Не удалось прочитать файл копии',

  // --- Входной тест ---
  'placement.title.pre': 'Входной',
  'placement.title.accent': 'тест',
  'placement.progress': 'Вопрос {n} из {total} · без подсказок',
  'placement.randomHint': 'Не знаешь — выбирай наугад: тест лишь показывает, с чего начать.',
  'placement.back': 'Назад',
  'placement.notReady.title': 'Тест готовится',
  'placement.notReady.body': 'Вопросы входного теста ещё пишутся. Загляни позже!',
  'placement.results.title.pre': 'Твоя карта',
  'placement.results.title.accent': 'знаний',
  'placement.results.some':
    'Уверенно: {known} из {total} секторов. Зачти их испытаниями боссов и сосредоточься на слепых зонах.',
  'placement.results.none':
    'Все сектора пока — неизведанная территория. Отличный повод пройти экспедицию с самого начала!',
  'placement.row.known':
    'Похоже, ты это знаешь: пройди Испытание босса, чтобы зачесть мир',
  'placement.row.blind': 'Слепая зона — начни отсюда',
  'placement.row.soon': 'Скоро',
  'placement.row.soon.title': 'Босс-урок мира ещё пишется',
  'placement.row.toMap': 'На карту',

  // --- Библиотека ---
  'library.tab.all': 'Все',
  'library.tab.skill': 'Скиллы',
  'library.tab.plugin': 'Плагины',
  'library.tab.mcp': 'MCP',
  'library.source.official': 'Официальный Anthropic',
  'library.source.verified': 'Проверенный',
  'library.source.community': 'Сообщество',
  'library.subtitle': 'Проверенные скиллы, плагины и MCP-серверы — с командами установки.',
  'library.empty.title': 'Библиотека пополняется',
  'library.empty.body':
    'Мы собираем и проверяем первые скиллы, плагины и MCP-серверы. Загляни сюда чуть позже!',
  'library.tablist.aria': 'Тип расширения',
  'library.search.placeholder': 'Поиск по названию или описанию…',
  'library.search.aria': 'Поиск по библиотеке',
  'library.usefulFor': 'Пригодится для:',
  'library.copy.aria': 'Копировать команду установки {name}',
  'library.copy.done': 'Готово',
  'library.copy': 'Копировать',
  'library.repo': 'Репозиторий',
  'library.docs': 'Документация',
  'library.nothingFound': 'Ничего не найдено. Попробуй изменить запрос или сбросить фильтры.',
  'library.resetFilters': 'Сбросить фильтры',
  'library.disclaimer':
    'Библиотека обновляется еженедельно по официальным источникам. Устанавливая сторонние расширения, проверяй, что доверяешь автору: они получают доступ к твоим данным.',

  // --- Сертификаты ---
  'certs.title.accent': 'Сертификаты',
  'certs.title.suffix': ' экспедиции',
  'certs.subtitle.some':
    'Доступно: {count} из {total}. Скачай PNG и покажи, что галактика покорена!',
  'certs.subtitle.none':
    'Проходи боссов секторов — за каждый зачтённый мир откроется сертификат.',
  'certs.master.title': 'Мастер Claude',
  'certs.master.subtitle': 'Вся галактика исследована',
  'certs.master.lock':
    'Пройди финальный экзамен сектора 8 «Экосистема» и получи бейдж «Сектор 8 исследован»',
  'certs.world.title': 'Сектор {order} исследован',
  'certs.world.lock': 'Одолей босса сектора {order} — «{title}»',
  'certs.available': 'Доступен',
  'certs.available.hint': 'Доступен — нажми, чтобы получить',
  'certs.modal.prefix': 'Сертификат:',
  'certs.modal.nameLabel': 'Имя на сертификате',
  'certs.modal.namePlaceholder': 'Например: Евгения Малина',
  'certs.modal.preview.aria': 'Предпросмотр сертификата',
  'certs.modal.download': 'Скачать PNG',
  'certs.modal.share': 'Поделиться',
  'certs.modal.needName': 'Введи имя, чтобы скачать сертификат.',
  'certs.modal.close': 'Закрыть',
  'certs.modal.dialogAria': 'Сертификат «{title}»',
  'certs.share.title': 'AI Экспедиция — {title}',

  // --- Сертификат (canvas) ---
  'cert.header': 'AI ЭКСПЕДИЦИЯ',
  'cert.word': 'СЕРТИФИКАТ',
  'cert.confirms': 'Настоящим подтверждается, что',
  'cert.defaultName': 'Исследователь',
  'cert.completed': 'успешно прошёл(ла) экспедицию по галактике знаний Claude',
  'cert.stats': '⚡ {xp} XP   ·   пройдено уроков: {lessons}',
  'cert.disclaimer': 'Неофициальный образовательный проект',

  // --- Повторение (страница) ---
  'review.done.title': 'Память укреплена!',
  'review.done.body':
    'Знания закреплены интервальным повторением. Следующее повторение этих уроков — через больший интервал.',
  'review.empty.title': 'Повторять пока нечего',
  'review.empty.body':
    'Уроки для повторения появляются через 3, 7 и 30 дней после прохождения. Пройди новые экспедиции — и возвращайся закреплять знания!',
  'review.perSession': '+{n} XP за сессию',
  'review.fromLesson': 'Из урока «{title}»',
  'review.finish': 'Завершить повторение',

  // --- Подвал / автор ---
  'footer.madeBy': 'Автор проекта',
  'footer.authorName': 'Евгения Малина',
  'footer.channel': 'Telegram-канал «Вайбкодинг»',
  'footer.contact': 'Написать в личку',
  'footer.tagline': 'Нужно создать сайт, бота или приложение? Напишите — помогу.',
  'footer.disclaimer':
    'Неофициальный образовательный проект. Не аффилирован с Anthropic, PBC и не одобрен ею. Claude и Anthropic — товарные знаки их правообладателей. Контент — самостоятельный образовательный пересказ со ссылками на первоисточники.',
  'footer.legal': 'Правовая информация',
};

const en: Record<string, string> = {
  // --- Brand / topbar ---
  'brand.academy': 'AI Expedition',
  'brand.pre': 'AI',
  'brand.accent': 'Expedition',
  'brand.subtitle':
    'An interactive learning game for Claude: chat, Claude Code, skills, plugins, MCP and API — from beginner to pro',
  'topbar.toMap': 'To the world map',
  'topbar.xp': 'Experience',
  'topbar.library': 'Library',
  'topbar.profile': 'Profile',
  'lang.switch': 'Interface language',

  // --- Common ---
  'common.check': 'Check',
  'common.reset': 'Reset',
  'common.correct': 'Correct!',
  'common.copied': 'Copied',
  'common.continue': 'Continue',
  'common.toMap': 'To the world map',
  'nav.toGalaxy': 'To the galaxy map',

  // --- Loader ---
  'loader.sector': 'Loading sector…',

  // --- Streak ---
  'streak.active': 'Streak: {days} days in a row',
  'streak.start': 'Start a streak — complete a lesson today',

  // --- Tracks ---
  'track.novice.title': 'From scratch',
  'track.novice.desc': 'Never used AI before — we start from the very basics',
  'track.user.title': 'User',
  'track.user.desc': 'I use the chat and want to unlock everything else',
  'track.developer.title': 'Developer',
  'track.developer.desc': 'I write code — I want Claude Code, MCP and the API',
  'track.business.title': 'Business',
  'track.business.desc': 'I want to automate work tasks',

  // --- Onboarding ---
  'onb.lang.title': 'Choose your interface language',
  'onb.lang.subtitle': 'You can change it anytime in your profile or the top bar.',
  'onb.welcome.subtitle': 'Master everything Claude can do — through play',
  'onb.welcome.start': 'Start the expedition',
  'onb.tracks.titlePre': 'Choose your',
  'onb.tracks.titleAccent': 'track',
  'onb.tracks.subtitle':
    'Your track shapes the recommended route through the galaxy sectors. You can change it anytime in your profile.',
  'onb.placement.titlePre': 'Already using',
  'onb.placement.subtitle':
    'Take the placement test (2 minutes) — 16 questions reveal which sectors you already know and which are blind spots. Familiar worlds can be cleared with boss challenges.',
  'onb.placement.take': 'Take the test',
  'onb.placement.skip': 'Skip',

  // --- Welcome toast ---
  'toast.welcome.title': 'Welcome to the expedition, explorer!',
  'toast.welcome.body':
    'Track {emoji} “{title}” selected — recommended sectors are marked on the map.',

  // --- World map ---
  'map.title.pre': 'The galaxy',
  'map.title.accent': 'map',
  'map.subtitle.start': 'Your expedition begins. Pick the first lesson of Sector 1!',
  'map.subtitle.progress': 'Lessons completed: {count}. Keep exploring!',
  'map.review.body': 'A short session locks in what you’ve learned. +25 XP for a review.',
  'map.nextSectors': 'Next galaxy sectors',
  'map.comingSoon': 'Soon',
  'map.sector': 'Sector {order}',
  'map.library.titleSuffix': ': ready-made skills, plugins and MCP',
  'map.library.body': 'Vetted extensions with install commands — level up your toolkit.',
  'map.whatsnew.pre': 'What’s',
  'map.whatsnew.accent': 'new',

  // --- Review (shared) ---
  'review.daily.pre': 'Daily',
  'review.daily.accent': 'review',
  'review.due.one': '{count} lesson is waiting',
  'review.due.few': '{count} lessons are waiting',
  'review.due.many': '{count} lessons are waiting',

  // --- World map (WorldMap) ---
  'worldmap.recommended': 'Recommended',
  'worldmap.passed': 'World cleared',
  'worldmap.bossChallenge': 'Boss challenge',
  'worldmap.bossChallenge.title': 'Beat the boss with no theory and clear the whole world',
  'worldmap.challengeSoon': 'Challenge — soon',
  'worldmap.bossSoon.title': 'The world’s boss lesson is still being written',

  // --- Lesson node ---
  'node.loading': 'loading content',
  'node.passed': 'cleared via challenge',
  'node.aria.boss': 'Boss: ',
  'node.aria.locked': ' (locked)',

  // --- Lesson screen ---
  'lesson.back.aria': 'Back to the map',
  'lesson.challengeInfo': 'Boss challenge: no theory, one mistake max',
  'lesson.min': '{n} min',
  'lesson.taskOf': 'Task {n} of {total}',
  'lesson.toTasks': 'To the tasks',
  'lesson.finish': 'Finish',
  'lesson.finishChallenge': 'Finish the challenge',
  'lesson.finishLesson': 'Finish the lesson',
  'lesson.readOriginal': 'Read the original',
  'lesson.verified': 'Verified: {date}',
  'lesson.foundBug': '⚑ Found a mistake in the lesson?',
  'lesson.orEmail': 'or email us',
  'lesson.notWritten.title': 'Content is loading',
  'lesson.notWritten.body':
    'This lesson is still being written. The expedition continues soon — check back later!',

  // --- Boss challenge: fail/success ---
  'challenge.fail.title': 'Challenge failed',
  'challenge.fail.body':
    'More than one mistake — the boss of Sector “{world}” held its ground. No worries: try again or work through the world’s lessons in order.',
  'challenge.retry': 'Try again',
  'challenge.study': 'Learn in order',
  'challenge.success.title': 'Challenge complete!',
  'challenge.success.body':
    'World “{world}” cleared. Its lessons stay open — come back for function cards and extra XP.',
  'challenge.alreadyPassed': 'World was already cleared',

  // --- Lesson complete overlay ---
  'complete.boss': 'Boss defeated!',
  'complete.lesson': 'Expedition complete!',
  'complete.alreadyDone': 'Lesson already completed',
  'complete.xp': '+{n} XP',
  'complete.streak': '🔥 Streak: {n} days',
  'complete.newCard': 'New card in your album',
  'complete.getCertificate': 'Get certificate',
  'complete.next': 'Next',

  // --- Badge ---
  'badge.new': 'New badge!',

  // --- Quiz ---
  'quiz.multiHint': 'Select several options and press “Check”.',
  'quiz.showHint': 'Show hint',

  // --- Build prompt ---
  'build.hint': 'Tap the blocks in the right order. Careful: some are extra.',
  'build.placeholder': 'Your prompt will appear here',
  'build.wrong': 'Not quite. Check the block order — and watch for an extra one.',
  'build.solved': 'Prompt assembled!',

  // --- Find bug ---
  'findbug.hint': 'Click the line where the mistake is hiding.',
  'findbug.wrong': 'This line is fine. Keep looking!',
  'findbug.solved': 'Mistake found!',

  // --- Chat simulator ---
  'chat.header.sim': 'simulator',
  'chat.empty': 'Write a message — “Claude” will reply',
  'chat.placeholder': 'Message Claude…',
  'chat.send.aria': 'Send',
  'chat.solved': 'Great conversation!',

  // --- Terminal simulator ---
  'term.err': 'command didn’t match — try again',
  'term.input.aria': 'Command input',
  'term.solved': 'Commands executed!',

  // --- Real mission ---
  'mission.title': 'Real mission',
  'mission.subtitle': 'A task in the real Claude — the most valuable practice and bonus XP.',
  'mission.checkYourself': 'Check yourself:',
  'mission.mentor.toggle': '🧑‍🚀 Want a real review?',
  'mission.mentor.body':
    'Install the “Expedition Mentor” skill (Library section) — and the real Claude will review your mission against this checklist.',
  'mission.mentor.copy': 'Copy mission for the mentor',
  'mission.copyBlock.checklist': 'Checklist:',
  'mission.copyBlock.footer': 'Review this AI Expedition mission against the checklist',
  'mission.done': 'Done',
  'mission.done.title': 'Mission complete! +{n} bonus XP',
  'mission.done.body': 'Real practice is the best way to cement a skill. Keep it up!',

  // --- Theory ---
  'callout.tip': '💡 Tip',
  'callout.warning': '⚠️ Important',
  'callout.docs': '📖 From the docs',
  'code.copy': 'Copy',
  'code.copied': 'Copied',
  'example.bad': 'Bad',
  'example.good': 'Good',

  // --- Function card ---
  'rarity.common': 'Common',
  'rarity.rare': 'Rare',
  'rarity.epic': 'Epic',
  'rarity.legendary': 'Legendary',
  'card.locked.desc': 'Complete a lesson to unlock this card.',

  // --- Profile ---
  'profile.title.pre': 'Explorer',
  'profile.title.accent': 'profile',
  'profile.level': 'Level {n}',
  'profile.xpTotal': '{n} XP total',
  'profile.daysInARow': 'days in a row',
  'profile.record': 'best: {n}',
  'profile.lessonsCompleted': 'Lessons completed: {n}',
  'profile.toNextLevel': 'To level {n}',
  'profile.track.selected': 'Track: “{track}”',
  'profile.track.none': 'Track: not selected',
  'profile.track.noneDesc': 'Pick a track — and recommended sectors will appear on the map',
  'profile.certificates': 'Certificates',
  'profile.certificates.title': 'Personalized certificates for completed sectors',
  'profile.placement': 'Placement test',
  'profile.placement.title': '16 questions — reveal which worlds you can clear via a challenge',
  'profile.changeTrack': 'Change track',
  'profile.badges': 'Badges',
  'profile.album': 'Card album',
  'profile.album.desc': 'Each card is a Claude feature you’ve mastered. Collect them all!',

  // --- Progress backup ---
  'backup.title': 'Progress & backup',
  'backup.body':
    'Your progress is stored in this browser on this device. Don’t use private/incognito mode — it wipes progress. To avoid losing progress or to move it to another device, save a backup.',
  'backup.download': 'Download backup',
  'backup.restore': 'Restore from backup',
  'backup.downloaded': 'Backup saved',
  'backup.restored': 'Progress restored',
  'backup.error': 'Could not read the backup file',

  // --- Placement test ---
  'placement.title.pre': 'Placement',
  'placement.title.accent': 'test',
  'placement.progress': 'Question {n} of {total} · no hints',
  'placement.randomHint': 'Not sure? Guess — the test only shows where to start.',
  'placement.back': 'Back',
  'placement.notReady.title': 'The test is being prepared',
  'placement.notReady.body': 'The placement questions are still being written. Check back later!',
  'placement.results.title.pre': 'Your knowledge',
  'placement.results.title.accent': 'map',
  'placement.results.some':
    'Confident in {known} of {total} sectors. Clear them via boss challenges and focus on your blind spots.',
  'placement.results.none':
    'Every sector is still uncharted. A perfect reason to run the whole expedition from the start!',
  'placement.row.known':
    'Looks like you know this: pass the Boss Challenge to clear the world',
  'placement.row.blind': 'Blind spot — start here',
  'placement.row.soon': 'Soon',
  'placement.row.soon.title': 'The world’s boss lesson is still being written',
  'placement.row.toMap': 'To the map',

  // --- Library ---
  'library.tab.all': 'All',
  'library.tab.skill': 'Skills',
  'library.tab.plugin': 'Plugins',
  'library.tab.mcp': 'MCP',
  'library.source.official': 'Official Anthropic',
  'library.source.verified': 'Verified',
  'library.source.community': 'Community',
  'library.subtitle': 'Vetted skills, plugins and MCP servers — with install commands.',
  'library.empty.title': 'The library is filling up',
  'library.empty.body':
    'We’re gathering and vetting the first skills, plugins and MCP servers. Check back soon!',
  'library.tablist.aria': 'Extension type',
  'library.search.placeholder': 'Search by name or description…',
  'library.search.aria': 'Search the library',
  'library.usefulFor': 'Useful for:',
  'library.copy.aria': 'Copy install command for {name}',
  'library.copy.done': 'Done',
  'library.copy': 'Copy',
  'library.repo': 'Repository',
  'library.docs': 'Documentation',
  'library.nothingFound': 'Nothing found. Try a different query or reset the filters.',
  'library.resetFilters': 'Reset filters',
  'library.disclaimer':
    'The library is updated weekly from official sources. When installing third-party extensions, make sure you trust the author: they get access to your data.',

  // --- Certificates ---
  'certs.title.accent': 'Certificates',
  'certs.title.suffix': ' of the expedition',
  'certs.subtitle.some':
    'Available: {count} of {total}. Download the PNG and show the galaxy is conquered!',
  'certs.subtitle.none': 'Beat sector bosses — a certificate opens for each world you clear.',
  'certs.master.title': 'Claude Master',
  'certs.master.subtitle': 'The whole galaxy explored',
  'certs.master.lock':
    'Pass the final exam of Sector 8 “Ecosystem” and earn the “Sector 8 explored” badge',
  'certs.world.title': 'Sector {order} explored',
  'certs.world.lock': 'Defeat the boss of Sector {order} — “{title}”',
  'certs.available': 'Available',
  'certs.available.hint': 'Available — tap to claim',
  'certs.modal.prefix': 'Certificate:',
  'certs.modal.nameLabel': 'Name on the certificate',
  'certs.modal.namePlaceholder': 'For example: Alex Johnson',
  'certs.modal.preview.aria': 'Certificate preview',
  'certs.modal.download': 'Download PNG',
  'certs.modal.share': 'Share',
  'certs.modal.needName': 'Enter a name to download the certificate.',
  'certs.modal.close': 'Close',
  'certs.modal.dialogAria': 'Certificate “{title}”',
  'certs.share.title': 'AI Expedition — {title}',

  // --- Certificate (canvas) ---
  'cert.header': 'AI EXPEDITION',
  'cert.word': 'CERTIFICATE',
  'cert.confirms': 'This certifies that',
  'cert.defaultName': 'Explorer',
  'cert.completed': 'has successfully completed the expedition across the Claude knowledge galaxy',
  'cert.stats': '⚡ {xp} XP   ·   lessons completed: {lessons}',
  'cert.disclaimer': 'Unofficial educational project',

  // --- Review (page) ---
  'review.done.title': 'Memory reinforced!',
  'review.done.body':
    'Your knowledge is locked in with spaced repetition. The next review of these lessons comes after a longer interval.',
  'review.empty.title': 'Nothing to review yet',
  'review.empty.body':
    'Lessons come up for review 3, 7 and 30 days after completion. Run new expeditions — and come back to reinforce your knowledge!',
  'review.perSession': '+{n} XP per session',
  'review.fromLesson': 'From lesson “{title}”',
  'review.finish': 'Finish the review',

  // --- Footer / author ---
  'footer.madeBy': 'Created by',
  'footer.authorName': 'Evgenia Malina',
  'footer.channel': 'Telegram channel “Vibecoding”',
  'footer.contact': 'Message me directly',
  'footer.tagline': 'Need a website, bot, or app built? Message me — I can help.',
  'footer.disclaimer':
    'An unofficial educational project. Not affiliated with, or endorsed by, Anthropic, PBC. Claude and Anthropic are trademarks of their respective owners. The content is an independent educational retelling with links to primary sources.',
  'footer.legal': 'Legal',
};

export const STRINGS: Record<LangCode, Record<string, string>> = { ru, en };
