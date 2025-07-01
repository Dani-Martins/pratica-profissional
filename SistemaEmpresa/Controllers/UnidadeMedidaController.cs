using Microsoft.AspNetCore.Mvc;
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
    public class UnidadeMedidaController : ControllerBase
    {
        private readonly UnidadeMedidaService _service;

        public UnidadeMedidaController(UnidadeMedidaService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UnidadeMedida>>> GetAll()
        {
            var unidades = await _service.GetAllAsync();
            return Ok(unidades);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UnidadeMedida>> GetById(int id)
        {
            var unidade = await _service.GetByIdAsync(id);
            if (unidade == null)
                return NotFound();
            return Ok(unidade);
        }

        [HttpPost]
        public async Task<ActionResult<UnidadeMedida>> Create([FromBody] UnidadeMedidaCreateDTO dto)
        {
            // Usando DateTime.Now para garantir compatibilidade com Cliente
            var now = DateTime.Now;
            var user = User?.Identity?.Name ?? "sistema";
            var unidade = new UnidadeMedida
            {
                UnidadeMedidaNome = dto.Nome?.ToUpperInvariant() ?? string.Empty,
                Situacao = dto.Situacao ? now : DateTime.MinValue, // ou lógica conforme regra de negócio
                DataCriacao = now,
                DataAlteracao = now,
                UserCriacao = user,
                UserAtualizacao = user
            };
            var created = await _service.CreateAsync(unidade);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UnidadeMedidaCreateDTO dto)
        {
            var unidade = await _service.GetByIdAsync(id);
            if (unidade == null)
                return NotFound();
            var now = DateTime.Now;
            var user = User?.Identity?.Name ?? "sistema";
            unidade.UnidadeMedidaNome = dto.Nome?.ToUpperInvariant() ?? string.Empty;
            unidade.Situacao = dto.Situacao ? now : DateTime.MinValue; // ou lógica conforme regra de negócio
            // NÃO alterar DataCriacao!
            unidade.DataAlteracao = now;
            unidade.UserAtualizacao = user;
            await _service.UpdateAsync(unidade);
            // Retornar o objeto atualizado para garantir que o frontend tenha os horários corretos
            return Ok(unidade);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var sucesso = await _service.InativarUnidadeMedidaAsync(id);
            if (!sucesso)
                return NotFound();
            return NoContent();
        }
    }
}
