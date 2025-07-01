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
    public class CategoriaController : ControllerBase
    {
        private readonly CategoriaService _service;

        public CategoriaController(CategoriaService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Categoria>>> GetAll()
        {
            var categorias = await _service.GetAllAsync();
            return Ok(categorias);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Categoria>> GetById(int id)
        {
            var categoria = await _service.GetByIdAsync(id);
            if (categoria == null)
                return NotFound();
            return Ok(categoria);
        }

        [HttpPost]
        public async Task<ActionResult<Categoria>> Create([FromBody] CategoriaCreateDTO dto)
        {
            var now = DateTime.Now;
            var user = User?.Identity?.Name ?? "sistema";
            var categoria = new Categoria
            {
                CategoriaNome = dto.Nome?.ToUpperInvariant() ?? string.Empty,
                Situacao = dto.Situacao ? now : DateTime.MinValue,
                DataCriacao = now,
                DataAlteracao = now,
                UserCriacao = user,
                UserAtualizacao = user
            };
            var created = await _service.CreateAsync(categoria);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CategoriaCreateDTO dto)
        {
            var categoria = await _service.GetByIdAsync(id);
            if (categoria == null)
                return NotFound();
            categoria.CategoriaNome = dto.Nome?.ToUpperInvariant() ?? string.Empty;
            categoria.Situacao = dto.Situacao ? DateTime.Now : DateTime.MinValue;
            categoria.DataAlteracao = DateTime.Now;
            categoria.UserAtualizacao = User?.Identity?.Name ?? "sistema";
            await _service.UpdateAsync(categoria);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Inativar(int id)
        {
            var ok = await _service.InativarCategoriaAsync(id);
            if (!ok)
                return NotFound();
            return NoContent();
        }
    }
}
