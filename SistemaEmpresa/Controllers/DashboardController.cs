using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaEmpresa.Data;
using SistemaEmpresa.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SistemaEmpresa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly PaisRepository _paisRepository;
        private readonly EstadoRepository _estadoRepository;
        private readonly CidadeRepository _cidadeRepository;

        public DashboardController(
            ApplicationDbContext context,
            PaisRepository paisRepository,
            EstadoRepository estadoRepository,
            CidadeRepository cidadeRepository)
        {
            _context = context;
            _paisRepository = paisRepository;
            _estadoRepository = estadoRepository;
            _cidadeRepository = cidadeRepository;
        }

        // Endpoint para dados de clientes do dashboard
        [HttpGet("clientes")]
        public IActionResult GetClientesData()
        {
            try
            {
                var clientesData = new
                {
                    total = 45,
                    ativos = 38,
                    novosMes = 5,
                    porEstado = new[]
                    {
                        new { estado = "SP", quantidade = 15 },
                        new { estado = "RJ", quantidade = 10 },
                        new { estado = "MG", quantidade = 8 },
                        new { estado = "RS", quantidade = 5 },
                        new { estado = "PR", quantidade = 7 }
                    },
                    ultimos = new[]
                    {
                        new { id = 1, nome = "Cliente Teste 1", cidade = "São Paulo", estado = "SP", ultimaCompra = DateTime.Now.AddDays(-5), valor = 1250.50, status = "Ativo" },
                        new { id = 2, nome = "Cliente Teste 2", cidade = "Rio de Janeiro", estado = "RJ", ultimaCompra = DateTime.Now.AddDays(-2), valor = 780.25, status = "Ativo" }
                    }
                };

                return Ok(clientesData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }

        // Endpoint para dados de vendas do dashboard
        [HttpGet("vendas")]
        public IActionResult GetVendasData()
        {
            try
            {
                var vendasData = new
                {
                    totalMes = 15750.80,
                    crescimento = 12.5,
                    porMes = new[] { 10500, 12300, 9800, 11200, 13400, 15750, 0, 0, 0, 0, 0, 0 }
                };

                return Ok(vendasData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }

        // Endpoint para dados de produtos do dashboard
        [HttpGet("produtos")]
        public IActionResult GetProdutosData()
        {
            try
            {
                var produtosData = new
                {
                    total = 120,
                    baixoEstoque = 8,
                    maisPopulares = new[]
                    {
                        new { id = 1, nome = "Produto A", quantidadeVendida = 45 },
                        new { id = 2, nome = "Produto B", quantidadeVendida = 32 },
                        new { id = 3, nome = "Produto C", quantidadeVendida = 28 }
                    }
                };

                return Ok(produtosData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardData()
        {
            try
            {
                var paises = await _paisRepository.GetAllAsync();
                var estados = await _estadoRepository.GetAllAsync();
                var cidades = await _cidadeRepository.GetAllAsync();

                var dashboardData = new
                {
                    localizacao = new
                    {
                        paises,
                        estados,
                        cidades
                    },
                };

                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("localizacao")]
        public async Task<IActionResult> GetLocalizacaoData()
        {
            try
            {
                var paises = await _paisRepository.GetAllAsync();
                var estados = await _estadoRepository.GetAllAsync();
                var cidades = await _cidadeRepository.GetAllAsync();

                var localizacaoData = new
                {
                    paises,
                    estados,
                    cidades
                };

                return Ok(localizacaoData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}