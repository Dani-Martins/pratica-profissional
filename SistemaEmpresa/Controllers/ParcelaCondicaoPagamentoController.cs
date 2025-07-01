using System;
using System.Collections.Generic;
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
    public class ParcelaCondicaoPagamentoController : ControllerBase
    {
        private readonly ParcelaCondicaoPagamentoService _service;

        public ParcelaCondicaoPagamentoController(ParcelaCondicaoPagamentoService service)
        {
            _service = service;
        }

        // GET: api/ParcelaCondicaoPagamento/CondicaoPagamento/5
        [HttpGet("CondicaoPagamento/{condicaoPagamentoId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Retorna todas as parcelas de uma condição de pagamento")]
        public async Task<IActionResult> GetByCondicaoPagamentoId(long condicaoPagamentoId)
        {
            try
            {
                var parcelas = await _service.GetByCondicaoPagamentoId(condicaoPagamentoId);
                return Ok(parcelas);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        // GET: api/ParcelaCondicaoPagamento/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Retorna uma parcela pelo ID")]
        public async Task<IActionResult> GetById(long id)
        {
            try
            {
                var parcela = await _service.GetById(id);
                
                if (parcela == null)
                    return NotFound($"Parcela com ID {id} não encontrada");
                    
                return Ok(parcela);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        // POST: api/ParcelaCondicaoPagamento/CondicaoPagamento/5
        [HttpPost("CondicaoPagamento/{condicaoPagamentoId}")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Cria uma nova parcela para uma condição de pagamento")]
        public async Task<IActionResult> Create(long condicaoPagamentoId, [FromBody] ParcelaCondicaoPagamentoCreateDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);
                
                var created = await _service.Create(condicaoPagamentoId, dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        // PUT: api/ParcelaCondicaoPagamento/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] ParcelaCondicaoPagamentoUpdateDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);
                    
                var updated = await _service.Update(id, dto);
                
                if (updated == null)
                    return NotFound(new { mensagem = $"Parcela com ID {id} não encontrada" });
                    
                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao atualizar parcela", erro = ex.Message });
            }
        }

        // DELETE: api/ParcelaCondicaoPagamento/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Remove uma parcela")]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                var success = await _service.Delete(id);
                
                if (!success)
                    return NotFound($"Parcela com ID {id} não encontrada");
                    
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }
    }
}