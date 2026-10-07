# Especificação de Requisitos: Calculadora Web

## 1. Visão Geral do Sistema
O objetivo deste documento é definir os requisitos funcionais e não funcionais para o desenvolvimento de uma aplicação web de calculadora básica, construída com **HTML5**, **CSS3** e **JavaScript puro (Vanilla JS)**. A ferramenta permitirá a execução de operações aritméticas fundamentais de forma simples, acessível, responsiva e de fácil manutenção, oferecendo suporte a temas visualmente adaptáveis (claro/escuro).

---

## 2. Requisitos Funcionais (RF)

| Código | Nome | Descrição |
| :--- | :--- | :--- |
| **RF01** | Digitação de Números | O sistema deve permitir que o usuário insira números de `0` a `9` clicando nas teclas da interface ou pelo teclado numérico físico. |
| **RF02** | Operações Básicas | O sistema deve executar as 4 operações básicas: Adição (`+`), Subtração (`-`), Multiplicação (`*`) e Divisão (`/`). |
| **RF03** | Ponto Decimal | O sistema deve permitir a inserção de ponto decimal (`.`) para números fracionários, limitando a no máximo um ponto por operando. |
| **RF04** | Cálculo do Resultado | O sistema deve calcular o resultado da expressão ao clicar no botão `=` ou pressionar `Enter` no teclado. |
| **RF05** | Limpeza de Display (AC/Clear) | O sistema deve disponibilizar um botão para limpar todo o histórico e redefinir o estado inicial da calculadora. |
| **RF06** | Limpeza Parcial (Backspace/CE) | O sistema deve permitir apagar o último caractere ou número digitado sem resetar a operação inteira. |
| **RF07** | Inversão de Sinal | O sistema deve permitir alterar o sinal do número atual entre positivo e negativo (`+/-`). |
| **RF08** | Cálculo de Porcentagem | O sistema deve permitir o cálculo de porcentagem (`%`) sobre o valor atual digitado. |
| **RF09** | Tratamento de Erro | Ao tentar realizar uma divisão por zero (`/ 0`), o sistema deve exibir uma mensagem clara (ex: `"Erro"`) em vez de interromper a execução. |
| **RF10** | Histórico de Operação | O display deve exibir a expressão atual em andamento (ex: `12 + 5`) em uma linha secundária acima do número principal. |
| **RF11** | Alternância de Tema (Light/Dark) | O sistema deve oferecer um botão/toggle para alternar manualmente entre o **Tema Claro** e o **Tema Escuro**. |
| **RF12** | Persistência do Tema | O sistema deve salvar o tema escolhido pelo usuário no `localStorage` do navegador para manter a preferência em visitas futuras. |

---

## 3. Requisitos Não Funcionais (RNF)

### 3.1. Usabilidade e Interface
* **RNF01 - Responsividade:** A interface deve se adaptar perfeitamente a diferentes tamanhos de tela (mobile, tablet e desktop).
* **RNF02 - Suporte a Temas (Claro e Escuro):** 
  * O design deve utilizar variáveis CSS (*CSS Custom Properties*) para gerenciar as paletas de cores dos temas claro e escuro de forma centralizada.
  * O sistema deve detectar automaticamente a preferência de tema do sistema operacional do usuário via *media query* (`prefers-color-scheme`), aplicando-a caso o usuário ainda não tenha definido uma preferência manual.
* **RNF03 - Mapeamento de Teclado:** A calculadora deve responder aos atalhos do teclado físico (`0-9`, `+`, `-`, `*`, `/`, `Enter`, `Backspace`, `Escape`).
* **RNF04 - Acessibilidade (a11y):** Elementos interativos devem possuir atributos ARIA adequados (`aria-label`, `role="button"`), bom contraste de cores em ambos os temas (WCAG AA) e indicação clara de foco navegando por `Tab`.

### 3.2. Manutenibilidade e Arquitetura de Código
* **RNF05 - Alta Manutenibilidade (Código Limpo):**
  * **Modularidade:** O código JavaScript deve ser bem estruturado em funções pequenas e com responsabilidade única (*Single Responsibility Principle*).
  * **Nomenclatura Clara:** Variáveis e funções devem utilizar nomes autoexplicativos em inglês ou português padrão (ex: `calculateResult()`, `updateDisplay()`, `toggleTheme()`).
  * **Baixo Acoplamento:** As funções de cálculo matemático devem ser desacopladas da manipulação direta da DOM.
* **RNF06 - Separação Estrita de Conceitos:**
  * **HTML (`index.html`):** Apenas marcação semântica e acessível da interface.
  * **CSS (`style.css`):** Estilização, variáveis globais de tema e regras de layout (Flexbox/Grid).
  * **JS (`script.js`):** Regras de negócio, manipulação de estado, persistência de preferências e escuta de eventos.
* **RNF07 - Sem Dependências Externas:** O projeto deve ser construído sem bibliotecas ou *frameworks* de terceiros, garantindo facilidade de leitura e manutenção direta no código nativo.

### 3.3. Desempenho e Compatibilidade
* **RNF08 - Compatibilidade de Navegadores:** O sistema deve ser compatível com as versões recentes de todos os principais navegadores (*Chrome, Firefox, Edge, Safari*).
* **RNF09 - Desempenho:** Carregamento instantâneo por tratar-se de arquivos estáticos leves.
* **RNF10 - Precisão Numérica:** Tratamento do arredondamento de ponto flutuante em JavaScript (ex: `0.1 + 0.2 = 0.3`), limitando o resultado a no máximo 8 casas decimais.

---

## 4. Estrutura Visual do Layout

```text
+-----------------------------------+
|  [☀️/🌙 Alternar Tema]            | <-- Toggle de Tema
|  [ 12 + 5                      ]  | <-- Histórico de Operação
|  [ 17                          ]  | <-- Display Principal
+-----------------------------------+
|  AC   |  +/-  |   %   |    /      |
|   7   |   8   |   9   |    *      |
|   4   |   5   |   6   |    -      |
|   1   |   2   |   3   |    +      |
|   0   |   .   |   ⌫   |    =      |
+-----------------------------------+
```

---

## 5. Regras de Negócio (RN)

1. **Sequência de Operadores:** Se o usuário pressionar dois operadores seguidos (ex: `5 + *`), o segundo operador deve substituir o primeiro.
2. **Limite de Dígitos:** O display deve aceitar no máximo 15 dígitos para evitar quebra do layout visual.
3. **Ponto Decimal Duplo:** Não é permitido inserir mais de um ponto decimal no mesmo operando (ex: `1.2.3` deve ser impedido).
4. **Prioridade de Tema:** A escolha manual do tema salva no `localStorage` sobrepõe a preferência padrão do sistema operacional.