import fetch from 'node-fetch';

console.log('Получение переменных окружения...');
const { token, xOrgId, GITHUB_REF_NAME, GITHUB_TRIGGERING_ACTOR } = process.env;
console.log('Парсинг JSON коммитов в массив...');
const commits = JSON.parse(process.env.commits);
console.log(getEnvVariablesLog());

console.log('\nПолучение сегодняшней даты...');
const date = new Date();
const dateString = [date.getDate(), (date.getMonth() + 1), date.getFullYear()].join('/');
console.log('Дата: ', dateString);

console.log('\nПолучение строк коммитов формата "хеш автор сообщение"...');
let commitsString = '';
for (const commit of commits) {
  console.log(`Получение строки коммита с id = ${commit.id}`);
  if (commitsString.length) commitsString += '\n';
  commitsString += [commit.id.slice(0, 7), commit.committer.username, commit.message].join(' ');
}
console.log(getCommitStringsLog());

// Запросы
const baseUrl = 'https://api.tracker.yandex.net/v2/issues/HOMEWORKSHRI-139';

// Заполнение заголовка и названия
(async () => {
  const url = baseUrl;
  const headers = {
    'Authorization': 'OAuth ' + token,
    'X-Org-ID': xOrgId
  };
  const body = JSON.stringify({
    "summary": `Релиз ${GITHUB_REF_NAME} - ${dateString}`,
    "description":
      `Ответственный за релиз: ${GITHUB_TRIGGERING_ACTOR}
   
     Коммиты, попавшие в релиз:
     ${commitsString}`
  });
  const method = 'PATCH';
  console.log(getFetchLog(url, method, body));
  await fetch(url, {
    method: method,
    headers: headers,
    body: body
  }).then(res => res.json()).then(ticket => console.log(getNewHeadlineDataLog(ticket)))
    .catch(err => console.log(err.message));
})();

// Добавление комментария
(async () => {
  const url = baseUrl + '/comments';
  const headers = {
    'Authorization': 'OAuth ' + token,
    'X-Org-ID': xOrgId
  };
  const body = JSON.stringify({
    "text": `Собрали образ c тегом ${GITHUB_REF_NAME}`
  });
  const method = 'POST';
  console.log(getFetchLog(url, method, body));
  await fetch(url, {
    method: method,
    headers: headers,
    body: body
  }).then(res => res.json()).then(comment => console.log(getNewCommentDataLog(comment)))
    .catch(err => console.log(err.message));
})();


// Функции логирования
function getNewHeadlineDataLog(ticket) {
  return `
Новое название: 
${ticket.summary}

Новое описание: 
${ticket.description}`
}

function getNewCommentDataLog(comment) {
  return `
Новый комментарий: 
${comment?.text} от ${comment?.createdBy?.display}
`}

function getFetchLog(url, method, body) {
  return `
Отправка запроса в трекер:
  url: ${url}
  method: ${method}
  body: ${body}`
}

function getEnvVariablesLog() {
  return `
Переменные окружения: 
  Название тега: ${GITHUB_REF_NAME}
  Автор релиза: ${GITHUB_TRIGGERING_ACTOR}
  Коммиты релиза: ${process.env.commits}`
}

function getCommitStringsLog() {
  return `
Строки коммитов: 
  ${commitsString}`
}