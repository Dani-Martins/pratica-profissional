using Microsoft.AspNetCore.Mvc;
using SistemaEmpresa.DTOs;
using SistemaEmpresa.Models;
using SistemaEmpresa.Services;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FuncaoFuncionarioController : ControllerBase
    {
        private readonly FuncaoFuncionarioService _funcaoFuncionarioService;

        public FuncaoFuncionarioController(FuncaoFuncionarioService funcaoFuncionarioService)
        {
            _funcaoFuncionarioService = funcaoFuncionarioService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FuncaoFuncionario>>> GetAll()
        {
            try
            {
                var funcoes = await _funcaoFuncionarioService.GetAllAsync();
                return Ok(funcoes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao listar funções de funcionários", erro = ex.Message });
            }
        }

        [HttpGet("ativos")]
        public async Task<ActionResult<IEnumerable<FuncaoFuncionario>>> GetAtivos()
        {
            try
            {
                var funcoes = await _funcaoFuncionarioService.GetAtivosAsync();
                return Ok(funcoes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao listar funções de funcionários ativos", erro = ex.Message });
            }
        }

        [HttpGet("inativos")]
        public async Task<ActionResult<IEnumerable<FuncaoFuncionario>>> GetInativos()
        {
            try
            {
                var funcoes = await _funcaoFuncionarioService.GetInativosAsync();
                return Ok(funcoes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao listar funções de funcionários inativos", erro = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FuncaoFuncionario>> GetById(long id)
        {
            try
            {
                var funcao = await _funcaoFuncionarioService.GetByIdAsync(id);
                return Ok(funcao);
            }
            catch (Exception ex) when (ex.Message.Contains("não encontrada"))
            {
                return NotFound(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar função de funcionário", erro = ex.Message });
            }
        }

        [HttpGet("nome/{nome}")]
        public async Task<ActionResult<IEnumerable<FuncaoFuncionario>>> GetByNome(string nome)
        {
            try
            {
                var funcoes = await _funcaoFuncionarioService.GetByNameAsync(nome);
                return Ok(funcoes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar funções de funcionários por nome", erro = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<FuncaoFuncionario>> Create([FromBody] FuncaoFuncionarioCreateDTO funcaoDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Log dos dados recebidos para debug
                Console.WriteLine($"Dados recebidos: {System.Text.Json.JsonSerializer.Serialize(funcaoDTO)}");

                // Converter campos de texto para maiúsculo
                var funcao = new FuncaoFuncionario
                {
                    FuncaoFuncionarioNome = funcaoDTO.FuncaoFuncionarioNome.ToUpper(), // O campo é required, então não precisa do operador ?
                    RequerCNH = funcaoDTO.RequerCNH,
                    TipoCNHRequerido = funcaoDTO.RequerCNH ? funcaoDTO.TipoCNHRequerido?.ToUpper() : null,
                    CargaHoraria = funcaoDTO.CargaHoraria,
                    Descricao = funcaoDTO.Descricao?.ToUpper(),
                    Observacao = funcaoDTO.Observacao?.ToUpper(),
                    Situacao = funcaoDTO.Situacao
                };

                Console.WriteLine($"Objeto criado: RequerCNH={funcao.RequerCNH}, TipoCNHRequerido={funcao.TipoCNHRequerido}");

                var novaFuncao = await _funcaoFuncionarioService.SaveAsync(funcao);
                return CreatedAtAction(nameof(GetById), new { id = novaFuncao.Id }, novaFuncao);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao criar função: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { mensagem = "Erro ao criar função de funcionário", erro = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] FuncaoFuncionarioUpdateDTO funcaoDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Log dos dados recebidos para debug
                Console.WriteLine($"Dados recebidos para atualização: {System.Text.Json.JsonSerializer.Serialize(funcaoDTO)}");

                var funcaoExistente = await _funcaoFuncionarioService.GetByIdAsync(id);
                
                // Atualizar os campos e converter para maiúsculo
                funcaoExistente.FuncaoFuncionarioNome = funcaoDTO.FuncaoFuncionarioNome.ToUpper();
                funcaoExistente.RequerCNH = funcaoDTO.RequerCNH;
                funcaoExistente.TipoCNHRequerido = funcaoDTO.RequerCNH ? funcaoDTO.TipoCNHRequerido?.ToUpper() : null;
                funcaoExistente.CargaHoraria = funcaoDTO.CargaHoraria;
                funcaoExistente.Descricao = funcaoDTO.Descricao?.ToUpper();
                funcaoExistente.Observacao = funcaoDTO.Observacao?.ToUpper();
                
                // Somente atualiza a situação se ela foi informada
                if (!string.IsNullOrEmpty(funcaoDTO.Situacao))
                {
                    funcaoExistente.Situacao = funcaoDTO.Situacao;
                }

                Console.WriteLine($"Objeto atualizado: RequerCNH={funcaoExistente.RequerCNH}, TipoCNHRequerido={funcaoExistente.TipoCNHRequerido}");

                await _funcaoFuncionarioService.SaveAsync(funcaoExistente);
                return NoContent();
            }
            catch (Exception ex) when (ex.Message.Contains("não encontrada"))
            {
                return NotFound(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao atualizar função: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { mensagem = "Erro ao atualizar função de funcionário", erro = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                await _funcaoFuncionarioService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex) when (ex.Message.Contains("não encontrada"))
            {
                return NotFound(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao excluir função de funcionário", erro = ex.Message });
            }
        }
    }
}
