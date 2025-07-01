using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    
    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginModel model)
    {
        // Aqui você faria a autenticação com seu banco de dados
        // Este é apenas um exemplo simplificado
        if (model.Email == "admin@sistema.com" && model.Senha == "admin123")
        {
            var token = GerarToken(model.Email);
            
            return Ok(new
            {
                token = token,
                usuario = new
                {
                    email = model.Email,
                    nome = "Administrador"
                }
            });
        }
        
        return Unauthorized(new { mensagem = "Credenciais inválidas" });
    }
    
    private string GerarToken(string email)
    {
        var secretKey = _configuration["JWT:Secret"] ?? 
            throw new InvalidOperationException("JWT Secret is not configured.");
            
        var chave = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(secretKey)
        );
        
        var credenciais = new SigningCredentials(chave, SecurityAlgorithms.HmacSha256);
        
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, email),
            new Claim(ClaimTypes.Role, "Admin")
        };
        
        var token = new JwtSecurityToken(
            issuer: _configuration["JWT:ValidIssuer"],
            audience: _configuration["JWT:ValidAudience"],
            claims: claims,
            expires: DateTime.Now.AddHours(3),
            signingCredentials: credenciais
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class LoginModel
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }
    
    [Required]
    public required string Senha { get; set; }
}