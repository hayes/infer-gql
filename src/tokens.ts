import { TokenKind } from "graphql";

export interface NameToken<T extends string = string> {
  kind: TokenKind.NAME;
  value: T;
}

export interface BangToken {
  kind: TokenKind.BANG;
  value: "!";
}

export interface DollarToken {
  kind: TokenKind.DOLLAR;
  value: "$";
}
export interface AmpToken {
  kind: TokenKind.AMP;
  value: "&";
}
export interface LeftParenToken {
  kind: TokenKind.PAREN_L;
  value: "(";
}
export interface RightParenToken {
  kind: TokenKind.PAREN_R;
  value: ")";
}
export interface SpreadToken {
  kind: TokenKind.SPREAD;
  value: "...";
}
export interface ColonToken {
  kind: TokenKind.COLON;
  value: ":";
}
export interface EqualsToken {
  kind: TokenKind.EQUALS;
  value: "=";
}
export interface AtToken {
  kind: TokenKind.AT;
  value: "@";
}
export interface LeftBracketToken {
  kind: TokenKind.BRACKET_L;
  value: "[";
}
export interface RightBracketToken {
  kind: TokenKind.BRACKET_R;
  value: "]";
}
export interface LeftBraceToken {
  kind: TokenKind.BRACE_L;
  value: "{";
}
export interface PipeToken {
  kind: TokenKind.PIPE;
  value: "|";
}
export interface RightBraceToken {
  kind: TokenKind.BRACE_R;
  value: "}";
}
export interface IntToken<T extends string = string> {
  kind: TokenKind.INT;
  value: T;
}
export interface FloatToken<T extends string = string> {
  kind: TokenKind.FLOAT;
  value: T;
}
export interface StringToken<T extends string = string> {
  kind: TokenKind.STRING;
  value: T;
}
export interface BlockStringToken<T extends string = string> {
  kind: TokenKind.BLOCK_STRING;
  value: T;
}
export interface CommentToken<T extends string = string> {
  kind: TokenKind.COMMENT;
  value: T;
}

export interface CommaToken {
  kind: "Comma";
  value: ",";
}

export type Token =
  | NameToken
  | BangToken
  | DollarToken
  | AmpToken
  | LeftParenToken
  | RightParenToken
  | SpreadToken
  | ColonToken
  | EqualsToken
  | AtToken
  | LeftBracketToken
  | RightBracketToken
  | LeftBraceToken
  | PipeToken
  | RightBraceToken
  | IntToken
  | FloatToken
  | StringToken
  | CommentToken
  | CommaToken;
