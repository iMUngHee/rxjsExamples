import { captions } from './captions.js';

const { from, range, fromEvent, merge, concat } = rxjs;
const {
  pluck,
  filter,
  map,
  throttleTime,
  startWith,
  bufferCount,
  skipLast,
  toArray,
  scan,
  mergeMap,
} = rxjs.operators;

export default window.onload = () => {
  init(captions, 4, printFunc);
};

const root = document.querySelector('#root');

function printFunc(data) {
  console.log(data);
  root.innerHTML = '';
  data.forEach((caption) => {
    const div = document.createElement('div');
    div.className = 'caption';
    div.innerText = caption;
    root.appendChild(div);
  });
}

function init(lines, spaces, printFunc) {
  const keypress$ = fromEvent(document, 'keydown').pipe(
    pluck('key'),
    filter((k) => k.includes('Arrow')),
    map((k) => {
      return {
        ArrowDown: 1,
        ArrowUp: -1,
        ArrowLeft: -1,
        ArrowRight: 1,
      }[k];
    }),
  );

  const scroll$ = merge(
    fromEvent(document, 'mousewheel'),
    fromEvent(document, 'wheel'),
  ).pipe(
    throttleTime(500),
    map((s) => (s.deltaY > 0 ? 1 : -1)),
  );

  const inputs$ = merge(keypress$, scroll$).pipe(startWith(0));

  const spaces$ = range(0, spaces).pipe(map(() => ''));

  const lines$ = concat(spaces$, from(lines), spaces$).pipe(
    bufferCount(spaces * 2 + 1, 1),
    skipLast(spaces * 2),
    toArray(),
  );

  const final$ = inputs$.pipe(
    scan((acc, cur) => {
      return Math.min(Math.max((acc += cur), 0), lines.length - 1);
    }),
    mergeMap((cursor) => {
      return lines$.pipe(map((buffers) => buffers[cursor]));
    }),
  );

  final$.subscribe(printFunc);
}
