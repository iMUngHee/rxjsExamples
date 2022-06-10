const { fromEvent } = rxjs;
const { ajax } = rxjs.ajax;
const { map, mergeMap, debounceTime, filter, distinctUntilChanged } =
  rxjs.operators;

const root = document.querySelector('#root');
const input = document.createElement('input');
const list = document.createElement('ul');

input.id = 'search';
input.placeholder = '검색어을 입력해주세요.';

list.id = 'suggestLayer';

root.appendChild(input);
root.appendChild(list);

function render(items) {
  list.innerHTML = items
    .map((user) => {
      return `
      <li class="user">
        <img src="${user.avatar_url}" width="50px" height="50px" />
        <p><a href="${user.html_url}" target="_blank">${user.login}</a></p>
      </li>
    `;
    })
    .join('');
}

const user$ = fromEvent(document.getElementById('search'), 'keyup').pipe(
  debounceTime(300),
  map((event) => event.target.value),
  distinctUntilChanged(),
  filter((query) => query.trim().length > 0),
  mergeMap((query) =>
    ajax.getJSON(`https://api.github.com/search/users?q=${query}`),
  ),
);

user$.subscribe((v) => render(v.items));
