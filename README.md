# LAP Compiler API

> LAP Compiler As A Microservice

A serverless microservice for parsing and transpiling LAP using [LAP-compiler](https://github.com/Minigugus/LAP-compiler).

# Deployement

This project is made to be used with [Now](https://now.sh).

`cd` into the project's root and just enter :
```sh
now
```

Congratulation ! You can now work with LAP code using a microservice !

# Usage

All requests must be a `POST` with a `text/plain` body (the LAP source code). You can optionally specify a `filename` query parameter to simulate the compilation of a file with value of `filename` as name.

URI are of the following form : `/[OUTPUT_LANGUAGE_NAME]` - `[OUTPUT_LANGUAGE_NAME]` is the name of the requested output language, e.g. `c` or `js`.

All response are served as JSON (`application/json`).

On success, the server returns JSON looking like :
```json
{
  "data": {
    "filename": "your-filename-here",
    "ast": {
      // The parsed AST of your program
    },
    "code": "(The source code of your LAP program in the language you requested)"
  }
}
```

On error, the server returns JSON with the following format :
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "An humain readable message describing the error."

    // Some extra properties may come here depending of the error.
  }
}
```

Exemple of a successful exchange :
```
-- REQUEST --
POST /c?filename=example.lap HTTP/1.1
Content-Type: text/plain

ACTION Somme
  VAR a, b : Numérique
  FONCTION Somme(a : Numérique, b : Numérique) : Numérique
  DEBUT
    RETOURNER a + b
  FINFONCTION
DEBUT
  ENTRER a, b
  SI a < 0 ALORS
    % Opérateur `-` dans `-[expression]` pas encore implémenté ^^' %
    a = a * (0 - 1)
  FSI
  RETOURNER Somme(a, b)
FINACTION

-- RESPONSE --
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "filename": "dev.lap",
    "ast": /* AST Object there... */,
    "code": "#include <stdio.h>\n\nint Somme(int a, int b)\n{\n  /* (Pas de variables locales) */\n\n  // INSTRUCTIONS //\n  return a + b;\n}\n\nvoid main()\n{\n  // DÉCLARATION DES VARIABLES //\n  int a;\n  int b;\n\n  // INSTRUCTIONS //\n  printf(\"a : \"); scanf(\"%d\", &a);\n  printf(\"b : \"); scanf(\"%d\", &b);\n  if (a < 0)\n  {\n    a = a * (0 - 1);\n  }\n  return Somme (a , b);\n}"
  }
}
```