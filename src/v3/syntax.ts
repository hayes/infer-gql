export interface SyntaxChild {
  name: string;
  kind: Syntax;
  repeat?: boolean;
  optional?: boolean;
}

export interface Syntax<Children extends SyntaxChild[] = SyntaxChild[]> {
  kind: 'literal' | 'word' | 'line' | 'group' | 'list' | 'block' | 'node' | 'conditional';
  trim: boolean;
  children: Children;
}

export interface Literal<Value extends string = string> extends Syntax<[]> {
  kind: 'literal';
  value: Value;
}

export interface Word<End extends string = string> extends Syntax<[]> {
  kind: 'word';
  value: string;
  end: End;
}

export interface Line extends Syntax<[]> {
  kind: 'line';
  value: string;
}

export interface Group<Start extends string = string, End extends string = string>
  extends Syntax<[]> {
  kind: 'group';
  start: Start;
  end: End;
}

export interface List<T extends Syntax = Syntax, S extends string = string> extends Syntax<[]> {
  kind: 'list';
  ofType: T;
  separator: S;
}

export interface SyntaxNode<
  Name extends string = string,
  Children extends SyntaxChild[] = SyntaxChild[],
> extends Syntax<Children> {
  kind: 'node';
  name: Name;
}

export interface Block<Types extends object = object, Default extends Syntax = Syntax>
  extends Syntax {
  kind: 'block';
  types: Types;
  end: string;
  start: string;
  default: Default;
  separator: string;
}

export interface Condition<
  Test extends string = string,
  Pass extends Syntax = Syntax,
  Fail extends Syntax = Syntax,
> extends Syntax {
  kind: 'conditional';
  test: Test;
  pass: Pass;
  fail: Fail;
}
