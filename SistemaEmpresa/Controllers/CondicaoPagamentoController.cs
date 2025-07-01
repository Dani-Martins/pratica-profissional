using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SistemaEmpresa.DTOs;
using SistemaEmpresa.Services;
using Swashbuckle.AspNetCore.Annotations;

namespace SistemaEmpresa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class CondicaoPagamentoController : ControllerBase
    {
        private readonly CondicaoPagamentoService _service;

        public CondicaoPagamentoController(CondicaoPagamentoService service)
        {
            _service = service;
        }

        // GET: api/CondicaoPagamento
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Lista todas as condições de pagamento")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var condicoes = await _service.GetAll();
                return Ok(condicoes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao listar condições de pagamento", erro = ex.Message });
            }
        }

        // GET: api/CondicaoPagamento/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Obtém condição de pagamento pelo ID")]
        public async Task<IActionResult> GetById(long id)
        {
            try
            {
                var condicao = await _service.GetById(id);
                
                if (condicao == null)
                    return NotFound(new { mensagem = $"Condição de pagamento com ID {id} não encontrada" });
                    
                return Ok(condicao);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = $"Erro ao buscar condição de pagamento", erro = ex.Message });
            }
        }

        // POST: api/CondicaoPagamento
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Cria uma nova condição de pagamento")]
        public async Task<IActionResult> Create([FromBody] CondicaoPagamentoCreateDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);
                
                var created = await _service.Create(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao criar condição de pagamento", erro = ex.Message });
            }
        }

        // PUT: api/CondicaoPagamento/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] CondicaoPagamentoUpdateDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);
                
                var updated = await _service.Update(id, dto);
                
                if (updated == null)
                    return NotFound(new { mensagem = $"Condição de pagamento com ID {id} não encontrada" });
                    
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao atualizar condição de pagamento", erro = ex.Message });
            }
        }

        // DELETE: api/CondicaoPagamento/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Remove uma condição de pagamento")]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                var success = await _service.Delete(id);
                
                if (!success)
                    return NotFound(new { mensagem = $"Condição de pagamento com ID {id} não encontrada" });
                    
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao excluir condição de pagamento", erro = ex.Message });
            }
        }
    }
}