using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{
    public class ParcelaCondicaoPagamentoDTO
    {
        public long Id { get; set; }
        public long CondicaoPagamentoId { get; set; }
        public int Numero { get; set; }
        public int Dias { get; set; }
        public decimal Percentual { get; set; }
        public long? FormaPagamentoId { get; set; }
        public string FormaPagamentoDescricao { get; set; } = string.Empty;
    }

    public class ParcelaCondicaoPagamentoCreateDTO
    {
        public int Numero { get; set; }
        public int Dias { get; set; }
        public decimal Percentual { get; set; }
        public long? FormaPagamentoId { get; set; }
        public string FormaPagamento { get; set; } = string.Empty;
    }

    public class ParcelaCondicaoPagamentoUpdateDTO
    {
        // Removido o campo Id, já que vem pela URL

        [Required(ErrorMessage = "Número da parcela é obrigatório")]
        public int Numero { get; set; }
        
        [Required(ErrorMessage = "Dias é obrigatório")]
        public int Dias { get; set; }
        
        [Required(ErrorMessage = "Percentual é obrigatório")]
        [Range(0.01, 100, ErrorMessage = "O percentual deve estar entre 0.01 e 100")]
        public decimal Percentual { get; set; }
        
        public long? FormaPagamentoId { get; set; }
    }
}