import {
  Whitespace,
  TrimLeft,
  Digit,
  NameChar,
  NameStart,
  ParseError,
} from "./util";
import {
  AmpToken,
  AtToken,
  BangToken,
  ColonToken,
  CommaToken,
  CommentToken,
  DollarToken,
  EqualsToken,
  FloatToken,
  LeftBraceToken,
  LeftBracketToken,
  LeftParenToken,
  NameToken,
  PipeToken,
  RightBraceToken,
  RightBracketToken,
  RightParenToken,
  SpreadToken,
  StringToken,
  Token,
} from "./tokens";

export type ParseName<
  T extends string,
  Prefix extends string,
  Acc extends Token[]
> = T extends `${NameChar}${infer Rest}`
  ? ParseName<
      Rest,
      T extends `${infer Name}${Rest}` ? `${Prefix}${Name}` : never,
      Acc
    >
  : Tokenize<T, [...Acc, NameToken<Prefix>]>;

export type ParseString<
  T extends string,
  Str extends string,
  Acc extends Token[]
> = T extends `${infer S}"${infer Rest}`
  ? S extends `${string}\\`
    ? S extends `${string}\\\\`
      ? Tokenize<Rest, [...Acc, StringToken<`${Str}${S}`>]>
      : ParseString<Rest, S, Acc>
    : Tokenize<Rest, [...Acc, StringToken<`${Str}${S}`>]>
  : ParseError<"Unterminated string literal">;

export type ParseBlockString<
  T extends string,
  Str extends string,
  Acc extends Token[]
> = T extends `${infer S}"""${infer Rest}`
  ? S extends `${string}\\`
    ? S extends `${string}\\\\`
      ? Tokenize<Rest, [...Acc, StringToken<`${Str}${S}`>]>
      : ParseBlockString<Rest, S, Acc>
    : Tokenize<Rest, [...Acc, StringToken<`${Str}${S}`>]>
  : ParseError<"Unterminated block string literal">;

export interface SymbolTokens {
  $: DollarToken;
  "!": BangToken;
  "&": AmpToken;
  "(": LeftParenToken;
  ")": RightParenToken;
  "...": SpreadToken;
  ":": ColonToken;
  "=": EqualsToken;
  "@": AtToken;
  "[": LeftBracketToken;
  "]": RightBracketToken;
  "{": LeftBraceToken;
  "|": PipeToken;
  "}": RightBraceToken;
  ",": CommaToken;
}

export type Tokenize<T extends string, Acc extends Token[] = []> = T extends ""
  ? Acc
  : string extends T
  ? ParseError<"SDL string must have a literal type">
  : T extends `${Whitespace}${infer Rest}`
  ? Tokenize<TrimLeft<Rest>, Acc>
  : T extends `${keyof SymbolTokens}${infer Rest}`
  ? T extends `${infer S}${Rest}`
    ? Tokenize<Rest, [...Acc, SymbolTokens[S & keyof SymbolTokens]]>
    : never
  : T extends `#${infer Comment}\n${infer Rest}`
  ? Tokenize<Rest, [...Acc, CommentToken<Comment>]>
  : T extends `#${infer Comment}`
  ? [...Acc, CommentToken<Comment>]
  : T extends `"${infer S}`
  ? ParseString<S, "", Acc>
  : T extends `"""${infer S}`
  ? ParseBlockString<S, "", Acc>
  : T extends `${Digit | "."}${infer Rest}` // TODO make this more correct
  ? Tokenize<Rest, [...Acc, FloatToken]>
  : T extends `${NameStart}${infer Rest}`
  ? ParseName<T, "", Acc>
  : ParseError<`Unknown token at "${T}"`>;
