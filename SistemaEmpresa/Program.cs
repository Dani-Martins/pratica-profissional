using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using MySqlConnector;
using System.Reflection;
using SistemaEmpresa.Repositories;
using SistemaEmpresa.Services;
using Microsoft.EntityFrameworkCore;
using SistemaEmpresa.Data;

var builder = WebApplication.CreateBuilder(args);

// Configuração do Entity Framework com MySQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)
    )
);

// Configurar MySqlConnection para injeção de dependência
builder.Services.AddTransient<MySqlConnection>(_ => new MySqlConnection(connectionString));

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins("http://localhost:3000")
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});

// Registro dos Repositories
builder.Services.AddScoped<CidadeRepository>();
builder.Services.AddScoped<ClienteRepository>();
builder.Services.AddScoped<CondicaoPagamentoRepository>();
builder.Services.AddScoped<EstadoRepository>();
builder.Services.AddScoped<FaturaRepository>();
builder.Services.AddScoped<FormaPagamentoRepository>();
builder.Services.AddScoped<FornecedorRepository>();
builder.Services.AddScoped<FuncaoFuncionarioRepository>();
builder.Services.AddScoped<FuncionarioRepository>();
builder.Services.AddScoped<ItemNFERepository>();
builder.Services.AddScoped<ModalidadeNFERepository>();
builder.Services.AddScoped<MovimentacaoNFERepository>();
builder.Services.AddScoped<NFERepository>();
builder.Services.AddScoped<PaisRepository>();
builder.Services.AddScoped<ParcelaCondicaoPagamentoRepository>();
builder.Services.AddScoped<ParcelaRepository>();
builder.Services.AddScoped<ProdutoFornecedorRepository>();
builder.Services.AddScoped<ProdutoRepository>();
builder.Services.AddScoped<TranspItemRepository>();
builder.Services.AddScoped<TransportadoraRepository>();
builder.Services.AddScoped<VeiculoRepository>();
builder.Services.AddScoped<UnidadeMedidaRepository>();
builder.Services.AddScoped<MarcaRepository>();
builder.Services.AddScoped<CategoriaRepository>();

// Registro dos Services
builder.Services.AddScoped<CidadeService>();
builder.Services.AddScoped<ClienteService>();
builder.Services.AddScoped<CondicaoPagamentoService>();
builder.Services.AddScoped<EstadoService>();
builder.Services.AddScoped<FaturaService>();
builder.Services.AddScoped<FormaPagamentoService>();
builder.Services.AddScoped<FornecedorService>();
builder.Services.AddScoped<FuncaoFuncionarioService>();
builder.Services.AddScoped<FuncionarioService>();
builder.Services.AddScoped<ItemNFEService>();
builder.Services.AddScoped<MappingService>();
builder.Services.AddScoped<ModalidadeNFEService>();
builder.Services.AddScoped<MovimentacaoNFEService>();
builder.Services.AddScoped<NFEService>();
builder.Services.AddScoped<PaisService>();
builder.Services.AddScoped<ParcelaCondicaoPagamentoService>();
builder.Services.AddScoped<ParcelaService>();
builder.Services.AddScoped<ProdutoService>();
builder.Services.AddScoped<TranspItemService>();
builder.Services.AddScoped<TransportadoraService>();
builder.Services.AddScoped<VeiculoService>();
builder.Services.AddScoped<UnidadeMedidaService>();
builder.Services.AddScoped<MarcaService>();
builder.Services.AddScoped<CategoriaService>();

// Adicionar serviços ao contêiner
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.DefaultIgnoreCondition = 
        System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "SistemaEmpresa API", 
        Version = "v1",
        Description = "API para gestão empresarial"
    });
    
    c.EnableAnnotations();
    
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// Configurar o pipeline de requisição HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Sistema Empresa API v1");
        c.RoutePrefix = "swagger";
        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        c.EnableFilter();
        c.DefaultModelsExpandDepth(-1);
        c.DisplayRequestDuration();
        c.EnableDeepLinking();
    });
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();
