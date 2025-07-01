using Microsoft.AspNetCore.Mvc;
using SistemaEmpresa.DTOs;
using SistemaEmpresa.Models;
using SistemaEmpresa.Services;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FornecedorController : ControllerBase
    {
        private readonly FornecedorService _fornecedorService;

        public FornecedorController(FornecedorService fornecedorService)
        {
            _fornecedorService = fornecedorService;
        }        [HttpGet]
        public async Task<ActionResult<IEnumerable<Fornecedor>>> GetAll()
        {
            try
            {
                Console.WriteLine("Iniciando GetAll em FornecedorController");
                var fornecedores = await _fornecedorService.GetAllAsync();
                Console.WriteLine($"GetAll concluído com sucesso: {fornecedores.Count()} fornecedores retornados");
                return Ok(fornecedores);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro em GetAll de FornecedorController: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"InnerException: {ex.InnerException.Message}");
                    Console.WriteLine($"InnerException StackTrace: {ex.InnerException.StackTrace}");
                }
                
                return StatusCode(500, new { mensagem = "Erro ao listar fornecedores", erro = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Fornecedor>> GetById(long id)
        {
            try
            {
                var fornecedor = await _fornecedorService.GetByIdAsync(id);
                return Ok(fornecedor);
            }
            catch (Exception ex) when (ex.Message.Contains("não encontrado"))
            {
                return NotFound(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar fornecedor", erro = ex.Message });
            }
        }

        [HttpGet("nome/{nome}")]
        public async Task<ActionResult<IEnumerable<Fornecedor>>> GetByName(string nome)
        {
            try
            {
                var fornecedores = await _fornecedorService.GetByNameAsync(nome);
                return Ok(fornecedores);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar fornecedores por nome", erro = ex.Message });
            }
        }

        [HttpGet("cnpj/{cnpj}")]
        public async Task<ActionResult<IEnumerable<Fornecedor>>> GetByCNPJ(string cnpj)
        {
            try
            {
                var fornecedores = await _fornecedorService.GetByCNPJAsync(cnpj);
                return Ok(fornecedores);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar fornecedores por CNPJ", erro = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<Fornecedor>> Create([FromBody] FornecedorCreateDTO fornecedorDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);                var fornecedor = new Fornecedor
                {
                    TipoPessoa = fornecedorDTO.TipoPessoa,
                    Nome = fornecedorDTO.Nome,
                    CPF = fornecedorDTO.CPF,                    RazaoSocial = fornecedorDTO.RazaoSocial ?? string.Empty,
                    NomeFantasia = fornecedorDTO.NomeFantasia,
                    CNPJ = fornecedorDTO.CNPJ,
                    InscricaoEstadual = fornecedorDTO.InscricaoEstadual,
                    Email = fornecedorDTO.Email,
                    Telefone = fornecedorDTO.Telefone,
                    Endereco = fornecedorDTO.Endereco,
                    Numero = fornecedorDTO.Numero,
                    Complemento = fornecedorDTO.Complemento,
                    Bairro = fornecedorDTO.Bairro,
                    CEP = fornecedorDTO.CEP,
                    CidadeId = fornecedorDTO.CidadeId,
                    Ativo = fornecedorDTO.Ativo,
                    
                    // Novos campos
                    Apelido = fornecedorDTO.Apelido,
                    LimiteCredito = fornecedorDTO.LimiteCredito,
                    RG = fornecedorDTO.RG,
                    Contato = fornecedorDTO.Contato,
                    CondicaoPagamentoId = fornecedorDTO.CondicaoPagamentoId,
                    Observacao = fornecedorDTO.Observacao
                };

                var novoFornecedor = await _fornecedorService.SaveAsync(fornecedor);
                return CreatedAtAction(nameof(GetById), new { id = novoFornecedor.Id }, novoFornecedor);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao criar fornecedor", erro = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] FornecedorUpdateDTO fornecedorDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);                var fornecedorExistente = await _fornecedorService.GetByIdAsync(id);
                
                // Atualizar o tipo de pessoa
                fornecedorExistente.TipoPessoa = fornecedorDTO.TipoPessoa ?? fornecedorExistente.TipoPessoa;
                fornecedorExistente.Nome = fornecedorDTO.Nome;
                fornecedorExistente.CPF = fornecedorDTO.CPF;fornecedorExistente.RazaoSocial = fornecedorDTO.RazaoSocial ?? fornecedorExistente.RazaoSocial;                fornecedorExistente.NomeFantasia = fornecedorDTO.NomeFantasia;
                fornecedorExistente.CNPJ = fornecedorDTO.CNPJ;
                fornecedorExistente.InscricaoEstadual = fornecedorDTO.InscricaoEstadual;
                fornecedorExistente.Email = fornecedorDTO.Email;
                fornecedorExistente.Telefone = fornecedorDTO.Telefone;
                fornecedorExistente.Endereco = fornecedorDTO.Endereco;
                fornecedorExistente.Numero = fornecedorDTO.Numero;
                fornecedorExistente.Complemento = fornecedorDTO.Complemento;
                fornecedorExistente.Bairro = fornecedorDTO.Bairro;
                fornecedorExistente.CEP = fornecedorDTO.CEP;
                fornecedorExistente.CidadeId = fornecedorDTO.CidadeId;
                fornecedorExistente.Ativo = fornecedorDTO.Ativo;
                
                // Novos campos
                fornecedorExistente.Apelido = fornecedorDTO.Apelido;
                fornecedorExistente.LimiteCredito = fornecedorDTO.LimiteCredito;
                fornecedorExistente.RG = fornecedorDTO.RG;
                fornecedorExistente.Contato = fornecedorDTO.Contato;
                fornecedorExistente.CondicaoPagamentoId = fornecedorDTO.CondicaoPagamentoId;
                fornecedorExistente.Observacao = fornecedorDTO.Observacao;

                await _fornecedorService.SaveAsync(fornecedorExistente);
                return NoContent();
            }
            catch (Exception ex) when (ex.Message.Contains("não encontrado"))
            {
                return NotFound(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao atualizar fornecedor", erro = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                await _fornecedorService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex) when (ex.Message.Contains("não encontrado"))
            {
                return NotFound(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao excluir fornecedor", erro = ex.Message });
            }
        }
    }
}