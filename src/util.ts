export type Whitespace = ' ' | '\n' | '\r' | '\t';

export type Alphabet =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';

export type Letter = Alphabet | Uppercase<Alphabet>;
export type Digit = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0';
export type NameStart = Letter | '_';
export type NameChar = NameStart | Digit;

export type TrimLeft<T extends string> = T extends `${Whitespace}${infer Rest}`
  ? TrimLeft<Rest>
  : T;

export type TrimRight<T extends string> = T extends `${infer Rest}${Whitespace}`
  ? TrimRight<Rest>
  : T;

export type Trim<T extends string> = TrimRight<TrimLeft<T>>;

export interface ParseError<T extends string = string> {
  kind: 'ParseError';
  message: T;
}

export type Merge<T> = { [K in keyof T]: T[K] };
