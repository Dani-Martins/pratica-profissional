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
    public class MarcaController : ControllerBase
    {
        private readonly MarcaService _service;

        public MarcaController(MarcaService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Marca>>> GetAll()
        {
            var marcas = await _service.GetAllAsync();
            return Ok(marcas);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Marca>> GetById(int id)
        {
            var marca = await _service.GetByIdAsync(id);
            if (marca == null)
                return NotFound();
            return Ok(marca);
        }

        [HttpPost]
        public async Task<ActionResult<Marca>> Create([FromBody] MarcaCreateDTO dto)
        {
            var now = DateTime.Now;
            var user = User?.Identity?.Name ?? "sistema";
            var marca = new Marca
            {
                MarcaNome = dto.Nome?.ToUpperInvariant() ?? string.Empty,
                Situacao = dto.Situacao ? now : DateTime.MinValue,
                DataCriacao = now,
                DataAlteracao = now,
                UserCriacao = user,
                UserAtualizacao = user
            };
            var created = await _service.CreateAsync(marca);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] MarcaCreateDTO dto)
        {
            var marca = await _service.GetByIdAsync(id);
            if (marca == null)
                return NotFound();
            marca.MarcaNome = dto.Nome?.ToUpperInvariant() ?? string.Empty;
            marca.Situacao = dto.Situacao ? DateTime.Now : DateTime.MinValue;
            marca.DataAlteracao = DateTime.Now;
            marca.UserAtualizacao = User?.Identity?.Name ?? "sistema";
            await _service.UpdateAsync(marca);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Inativar(int id)
        {
            var ok = await _service.InativarMarcaAsync(id);
            if (!ok)
                return NotFound();
            return NoContent();
        }
    }
}
