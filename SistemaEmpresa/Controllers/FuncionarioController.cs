using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using SistemaEmpresa.DTOs;
using SistemaEmpresa.Models;
using SistemaEmpresa.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public class FuncionarioController : ControllerBase
    {
        private readonly FuncionarioService _funcionarioService;

        public FuncionarioController(FuncionarioService funcionarioService)
        {
            _funcionarioService = funcionarioService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Funcionario>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Funcionario>>> GetAll([FromQuery] bool incluirInativos = false)
        {
            try
            {
                Console.WriteLine($"FuncionarioController.GetAll(): incluirInativos={incluirInativos}");
                var funcionarios = await _funcionarioService.GetAllAsync(incluirInativos);
                Console.WriteLine($"FuncionarioController.GetAll(): Encontrados {funcionarios?.Count() ?? 0} funcionários");
                return Ok(funcionarios);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao listar funcionários: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"InnerException: {ex.InnerException.Message}");
                    Console.WriteLine($"InnerException StackTrace: {ex.InnerException.StackTrace}");
                }
                
                return StatusCode(500, new { mensagem = "Erro ao listar funcionários", erro = ex.Message, detalhe = ex.InnerException?.Message });
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Funcionario), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Funcionario>> GetById(long id)
        {
            try
            {
                var funcionario = await _funcionarioService.GetByIdAsync(id);
                return Ok(funcionario);
            }
            catch (Exception ex) when (ex.Message.Contains("não encontrado"))
            {
                return NotFound(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar funcionário", erro = ex.Message });
            }
        }

        [HttpGet("nome/{nome}")]
        [ProducesResponseType(typeof(IEnumerable<Funcionario>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Funcionario>>> GetByName(string nome)
        {
            try
            {
                var funcionarios = await _funcionarioService.GetByNameAsync(nome);
                return Ok(funcionarios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar funcionários por nome", erro = ex.Message });
            }
        }

        [HttpPost]
        [ProducesResponseType(typeof(Funcionario), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Funcionario>> Create([FromBody] FuncionarioCreateDTO funcionarioDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);
                
                var funcionario = new Funcionario
                {
                    TipoPessoa = "F", // Sempre pessoa física
                    Nome = funcionarioDTO.Nome?.ToUpper() ?? string.Empty,
                    Apelido = funcionarioDTO.Apelido?.ToUpper(),
                    CPF = funcionarioDTO.CPF,
                    RG = funcionarioDTO.RG?.ToUpper(),
                    CNH = funcionarioDTO.CNH?.ToUpper(),
                    DataValidadeCNH = funcionarioDTO.DataValidadeCNH,
                    Sexo = funcionarioDTO.Sexo,
                    EstadoCivil = funcionarioDTO.EstadoCivil,
                    IsBrasileiro = funcionarioDTO.IsBrasileiro,
                    Nacionalidade = funcionarioDTO.Nacionalidade,
                    Observacoes = funcionarioDTO.Observacoes?.ToUpper(),
                    FuncaoFuncionarioId = funcionarioDTO.FuncaoFuncionarioId,
                    DataNascimento = funcionarioDTO.DataNascimento,
                    Telefone = funcionarioDTO.Telefone,
                    Email = funcionarioDTO.Email,
                    Endereco = funcionarioDTO.Endereco,
                    Numero = funcionarioDTO.Numero,
                    Complemento = funcionarioDTO.Complemento,
                    Bairro = funcionarioDTO.Bairro,
                    CEP = funcionarioDTO.CEP,
                    CidadeId = funcionarioDTO.CidadeId,
                    Salario = funcionarioDTO.Salario,
                    DataAdmissao = funcionarioDTO.DataAdmissao,
                    DataDemissao = funcionarioDTO.DataDemissao,
                    Ativo = funcionarioDTO.Ativo,
                    DataCriacao = DateTime.Now,
                    UserCriacao = "SISTEMA"
                };

                var novoFuncionario = await _funcionarioService.SaveAsync(funcionario);
                return CreatedAtAction(nameof(GetById), new { id = novoFuncionario.Id }, novoFuncionario);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao criar funcionário", erro = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(long id, [FromBody] FuncionarioUpdateDTO funcionarioDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var funcionarioExistente = await _funcionarioService.GetByIdAsync(id);
                // TipoPessoa é sempre F (física) agora
                funcionarioExistente.Nome = funcionarioDTO.Nome?.ToUpper() ?? funcionarioExistente.Nome;
                funcionarioExistente.Apelido = funcionarioDTO.Apelido?.ToUpper();
                funcionarioExistente.CPF = funcionarioDTO.CPF;
                funcionarioExistente.RG = funcionarioDTO.RG?.ToUpper();
                funcionarioExistente.CNH = funcionarioDTO.CNH?.ToUpper();
                funcionarioExistente.DataValidadeCNH = funcionarioDTO.DataValidadeCNH;
                funcionarioExistente.Sexo = funcionarioDTO.Sexo;
                funcionarioExistente.EstadoCivil = funcionarioDTO.EstadoCivil;
                funcionarioExistente.IsBrasileiro = funcionarioDTO.IsBrasileiro;
                funcionarioExistente.Nacionalidade = funcionarioDTO.Nacionalidade;
                funcionarioExistente.Observacoes = funcionarioDTO.Observacoes?.ToUpper();
                funcionarioExistente.FuncaoFuncionarioId = funcionarioDTO.FuncaoFuncionarioId;
                funcionarioExistente.DataNascimento = funcionarioDTO.DataNascimento;
                funcionarioExistente.Telefone = funcionarioDTO.Telefone;
                funcionarioExistente.Email = funcionarioDTO.Email;
                funcionarioExistente.Endereco = funcionarioDTO.Endereco;
                funcionarioExistente.Numero = funcionarioDTO.Numero;
                funcionarioExistente.Complemento = funcionarioDTO.Complemento;
                funcionarioExistente.Bairro = funcionarioDTO.Bairro;
                funcionarioExistente.CEP = funcionarioDTO.CEP;
                funcionarioExistente.CidadeId = funcionarioDTO.CidadeId;
                funcionarioExistente.Salario = funcionarioDTO.Salario;
                funcionarioExistente.DataAdmissao = funcionarioDTO.DataAdmissao ?? funcionarioExistente.DataAdmissao;
                funcionarioExistente.DataDemissao = funcionarioDTO.DataDemissao;
                funcionarioExistente.Ativo = funcionarioDTO.Ativo;
                funcionarioExistente.DataAlteracao = DateTime.Now;
                funcionarioExistente.UserAtualizacao = "SISTEMA";

                await _funcionarioService.SaveAsync(funcionarioExistente);
                return NoContent();
            }
            catch (Exception ex) when (ex.Message.Contains("não encontrado"))
            {
                return NotFound(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao atualizar funcionário", erro = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                await _funcionarioService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex) when (ex.Message.Contains("não encontrado"))
            {
                return NotFound(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao excluir funcionário", erro = ex.Message });
            }
        }
    }
}