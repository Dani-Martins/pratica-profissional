using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{
    public class TranspItemDTO
    {
        public long Id { get; set; }

        [Required(ErrorMessage = "Código é obrigatório")]
        [StringLength(20, ErrorMessage = "Código deve ter no máximo 20 caracteres")]
        public string Codigo { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "Descrição deve ter no máximo 100 caracteres")]
        public string? Descricao { get; set; }

        public long? TransportadoraId { get; set; }

        [StringLength(20, ErrorMessage = "Código da transportadora deve ter no máximo 20 caracteres")]
        public string? CodigoTransp { get; set; }

        public bool Ativo { get; set; }

        public TransportadoraDTO? Transportadora { get; set; }
    }

    public class CreateTranspItemDTO
    {
        [Required(ErrorMessage = "Código é obrigatório")]
        [StringLength(20, ErrorMessage = "Código deve ter no máximo 20 caracteres")]
        public string Codigo { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "Descrição deve ter no máximo 100 caracteres")]
        public string? Descricao { get; set; }

        public long? TransportadoraId { get; set; }

        [StringLength(20, ErrorMessage = "Código da transportadora deve ter no máximo 20 caracteres")]
        public string? CodigoTransp { get; set; }
    }

    public class UpdateTranspItemDTO : CreateTranspItemDTO
    {
        public bool Ativo { get; set; }
    }
}