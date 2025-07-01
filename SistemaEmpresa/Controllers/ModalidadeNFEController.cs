using Microsoft.AspNetCore.Mvc;
using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ModalidadeNFEController : ControllerBase
    {
        private readonly ModalidadeNFERepository _repository;

        public ModalidadeNFEController(ModalidadeNFERepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ModalidadeNFE>>> Get()
        {
            try
            {
                var modalidades = await _repository.ReadAll();
                return Ok(modalidades);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar modalidades", erro = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ModalidadeNFE>> GetById(long id)
        {
            try
            {
                var modalidade = await _repository.ReadById(id);
                if (modalidade == null)
                    return NotFound(new { mensagem = $"Modalidade NFE com ID {id} não encontrada" });
                
                return Ok(modalidade);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao buscar modalidade", erro = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ModalidadeNFE>> Post([FromBody] ModalidadeNFE modalidade)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var sucesso = await _repository.Create(modalidade);
                if (!sucesso)
                    return BadRequest(new { mensagem = "Erro ao criar modalidade" });

                return CreatedAtAction(nameof(GetById), new { id = modalidade.Id }, modalidade);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao criar modalidade", erro = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ModalidadeNFE>> Put(long id, [FromBody] ModalidadeNFE modalidade)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var sucesso = await _repository.Update(id, modalidade);
                if (!sucesso)
                    return NotFound(new { mensagem = $"Modalidade NFE com ID {id} não encontrada" });

                return Ok(modalidade);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao atualizar modalidade", erro = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(long id)
        {
            try
            {
                var sucesso = await _repository.Delete(id);
                if (!sucesso)
                    return NotFound(new { mensagem = $"Modalidade NFE com ID {id} não encontrada" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao excluir modalidade", erro = ex.Message });
            }
        }
    }
}