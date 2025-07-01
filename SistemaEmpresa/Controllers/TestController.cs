using Microsoft.AspNetCore.Mvc;
using System;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet]
        public IActionResult Test()
        {
            try
            {
                return Ok(new { 
                    message = "API está funcionando corretamente!",
                    timestamp = DateTime.Now,
                    cors = "Configurado corretamente" 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
