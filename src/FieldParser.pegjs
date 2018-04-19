Main = VariableString / SimpleString

VariableString
  = SimpleString head:Variable tail:VariableString { return {
     raw: text(),
     variables: [head, ...tail.variables],
    }}
  / SimpleString variable:Variable SimpleString { return {
    raw: text(),
    variables: [variable],
  }}

SimpleString = $(!VarBlockOpen .)*

Variable
  = VarBlockOpen scope:Scope ':' name:VarName '|' transformers:TransformersList VarBlockClose { return {
    match: text(),
    scope,
    name,
    transformers,
  }}
  / VarBlockOpen scope:Scope ':' name:VarName VarBlockClose { return {
    match: text(),
    scope,
    name,
    transformers: [],
  }}

Scope = $(NonSpecialChar)*

VarName = QuotedString / ComplexVarName / SimpleVarName

ComplexVarName
  = SimpleVarName? head:Variable tail:ComplexVarName { return {
    raw: text(),
    variables: [head, ...tail.variables],
  }}
  / SimpleVarName? variable:Variable SimpleVarName? { return {
    raw: text(),
    variables: [variable]
  }}

SimpleVarName = $(NonSpecialChar)+

TransformersList
  = head:Transformer '|' tail:TransformersList { return [head, ...tail] }
  / t:Transformer { return [t] }

Transformer
  = name:TransformerName '(' args:ArgsList ')' { return { name, args }}
  / TransformerName { return { name: text(), args: [] }}

ArgsList
  = head: Argument ',' tail:ArgsList { return [head, ...tail] }
  / a:Argument { return [a] }

Argument = Boolean / Number / QuotedString / ComplexArgument / SimpleArgument

ComplexArgument
  = SimpleArgument? head:Variable tail:ComplexArgument { return {
    raw: text(),
    variables: [head, ...tail.variables],
  }}
  / SimpleArgument? variable:Variable SimpleArgument? { return {
    raw: text(),
    variables: [variable],
  }}

SimpleArgument = $(NonSpecialChar)+

Boolean
  = 'true' !NonSpecialChar { return true }
  / 'false' !NonSpecialChar { return false }

Number
  = [0-9]+ '.' [0-9]+ { return parseFloat(text()) }
  / [0-9]+ { return parseInt(text()) }

QuotedString
  = "'" str:$[^']+ "'" { return str }
  / '"' str:$[^"]+ '"' { return str }

TransformerName = $(NonSpecialChar)+

NonSpecialChar = [a-z0-9._-]i
VarBlockOpen = '${'
VarBlockClose = '}'
