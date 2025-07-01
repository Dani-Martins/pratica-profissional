using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{
    public class ClienteUpdateDTO
    {
        public string? Nome { get; set; }
        
        public string? Email { get; set; }
        
        public string? Telefone { get; set; }
        
        // Campos específicos para pessoa física
        public string? CPF { get; set; }
        
        // Campos específicos para pessoa jurídica
        public string? RazaoSocial { get; set; }
        
        public string? NomeFantasia { get; set; }
        
        public string? CNPJ { get; set; }
        
        public string? InscricaoEstadual { get; set; }
        
        // Endereço
        public string? Endereco { get; set; }
        
        public string? Numero { get; set; }
        
        public string? Complemento { get; set; }
        
        public string? Bairro { get; set; }
        
        public string? CEP { get; set; }
        
        public long? CidadeId { get; set; }
        
        public bool Ativo { get; set; } = true;
    }
}
