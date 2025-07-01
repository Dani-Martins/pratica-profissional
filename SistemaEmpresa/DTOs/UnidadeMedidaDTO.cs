using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{
    public class UnidadeMedidaDTO
    {
        public int Id { get; set; }
        public string UnidadeMedidaNome { get; set; } = string.Empty;
        public DateTime Situacao { get; set; }
        public DateTime DataCriacao { get; set; }
        public DateTime DataAlteracao { get; set; }
        public string UserCriacao { get; set; } = string.Empty;
        public string UserAtualizacao { get; set; } = string.Empty;
    }

    public class UnidadeMedidaCreateDTO
    {
        [Required]
        [StringLength(255)]
        public string Nome { get; set; } = string.Empty;
        [Required]
        public bool Situacao { get; set; }
    }
}
