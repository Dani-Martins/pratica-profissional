# Projeto-de-Prática-Profissional
Este é meu Projeto de Conclusão do meu curso de Sistemas de Informação na matéria de Prática Profissional

## Atualização da Padronização de Estados

### Descrição das alterações
Foram realizadas as seguintes alterações para padronizar a tela de Estados seguindo o mesmo padrão da tela de Países:

1. **Backend (C#):**
   - Correção no `EstadoController.cs` para garantir que o campo `situacao` seja retornado como inteiro e corretamente interpretado como booleano
   - Implementação de método auxiliar no `EstadoService.cs` para mapear consistentemente dados entre DTO e modelo
   - Atualização do `EstadoRepository.cs` para garantir que todos os métodos retornem o campo `situacao`
   - Correção de SQL em consultas para padronizar o retorno dos campos

2. **Frontend (React):**
   - Atualização do `EstadoList.js` para usar filtros e exibir situação ativa/inativa com badges
   - Correção na lógica de filtragem e exibição da situação para usar `Boolean()`
   - Padronização dos botões de ação e mensagens de erro/sucesso
   - Remoção de logs de depuração temporários

3. **Banco de Dados:**
   - Criação de script SQL para corrigir os valores da coluna `situacao` na tabela `estado`
   - Script de diagnóstico para verificar a consistência dos dados de situação

### Scripts SQL
- `verificar_situacao_estados.sql`: Verifica como estão os valores na coluna situacao
- `correcao_completa_situacao_estados.sql`: Script completo para verificar e corrigir os valores
- `script_correcao_estados.sql`: Script simplificado para atualizar todos os estados para ativos
