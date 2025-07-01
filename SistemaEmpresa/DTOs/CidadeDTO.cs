using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{    public class CidadeCreateDTO
    {
        [Required(ErrorMessage = "O nome da cidade é obrigatório")]
        public required string Nome { get; set; }
        
        [Required(ErrorMessage = "O código IBGE é obrigatório")]
        public required string CodigoIBGE { get; set; }
        
        [Required(ErrorMessage = "O ID do estado é obrigatório")]
        public long EstadoId { get; set; }
        
        // Campo para controlar se a cidade está ativa ou inativa
        public bool Situacao { get; set; } = true;
    }    public class CidadeUpdateDTO
    {
        [Required(ErrorMessage = "O nome da cidade é obrigatório")]
        public required string Nome { get; set; }
        
        [Required(ErrorMessage = "O código IBGE é obrigatório")]
        public required string CodigoIBGE { get; set; }
        
        [Required(ErrorMessage = "O ID do estado é obrigatório")]
        public long EstadoId { get; set; }
        
        // Campo para controlar se a cidade está ativa ou inativa
        public bool Situacao { get; set; } = true;
    }
}