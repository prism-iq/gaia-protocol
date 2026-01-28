//! Gaia Protocol v3.0 - La Terre
//! Pantheon benchmarking daemon, ground truth for PRISM-IQ.
//! phi^3 = 4.236 -- niveau 4 du GOLEM ("cell -- polymers organized")
//! According to Nyx Daemon

use axum::{
    extract::State,
    http::Method,
    routing::{get, post},
    Json, Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use sysinfo::{Disks, Networks, System};
use tokio::net::TcpListener;
use tokio::sync::RwLock;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;

// =============================================================================
//  Constants
// =============================================================================

const PHI: f64 = 1.618033988749895;
const PORT: u16 = 9500;
const DATA_DIR: &str = "/data/nyx/gaia";
const PAPERS_DIR: &str = "/data/nyx/gaia/papers";

// =============================================================================
//  Shared application state
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppState {
    pub boot_time: DateTime<Utc>,
    pub request_count: u64,
    pub papers: Vec<HarvestedPaper>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            boot_time: Utc::now(),
            request_count: 0,
            papers: Vec::new(),
        }
    }
}

type SharedState = Arc<RwLock<AppState>>;

// =============================================================================
//  Data structures -- System metrics
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub cpu_usage_percent: f64,
    pub cpu_count: usize,
    pub memory_total_mb: u64,
    pub memory_used_mb: u64,
    pub memory_percent: f64,
    pub disk_total_gb: f64,
    pub disk_used_gb: f64,
    pub disk_percent: f64,
    pub net_rx_bytes: u64,
    pub net_tx_bytes: u64,
    pub load_avg_1: f64,
    pub load_avg_5: f64,
    pub load_avg_15: f64,
    pub uptime_secs: u64,
}

fn collect_system_metrics() -> SystemMetrics {
    let mut sys = System::new_all();
    sys.refresh_all();

    // CPU: average across all cores
    let cpu_usage = if sys.cpus().is_empty() {
        0.0
    } else {
        sys.cpus().iter().map(|c| c.cpu_usage() as f64).sum::<f64>() / sys.cpus().len() as f64
    };

    // Memory
    let mem_total = sys.total_memory() / (1024 * 1024);
    let mem_used = sys.used_memory() / (1024 * 1024);
    let mem_pct = if mem_total > 0 {
        (mem_used as f64 / mem_total as f64) * 100.0
    } else {
        0.0
    };

    // Disk
    let disks = Disks::new_with_refreshed_list();
    let mut disk_total: f64 = 0.0;
    let mut disk_used: f64 = 0.0;
    for disk in disks.list() {
        let total = disk.total_space() as f64 / (1024.0 * 1024.0 * 1024.0);
        let avail = disk.available_space() as f64 / (1024.0 * 1024.0 * 1024.0);
        disk_total += total;
        disk_used += total - avail;
    }
    let disk_pct = if disk_total > 0.0 {
        (disk_used / disk_total) * 100.0
    } else {
        0.0
    };

    // Network
    let networks = Networks::new_with_refreshed_list();
    let mut rx_total: u64 = 0;
    let mut tx_total: u64 = 0;
    for (_name, data) in networks.list() {
        rx_total += data.total_received();
        tx_total += data.total_transmitted();
    }

    // Load average
    let load = System::load_average();

    SystemMetrics {
        cpu_usage_percent: cpu_usage,
        cpu_count: sys.cpus().len(),
        memory_total_mb: mem_total,
        memory_used_mb: mem_used,
        memory_percent: mem_pct,
        disk_total_gb: disk_total,
        disk_used_gb: disk_used,
        disk_percent: disk_pct,
        net_rx_bytes: rx_total,
        net_tx_bytes: tx_total,
        load_avg_1: load.one,
        load_avg_5: load.five,
        load_avg_15: load.fifteen,
        uptime_secs: System::uptime(),
    }
}

// =============================================================================
//  Data structures -- Golden ratio validation
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationRequest {
    /// Values to score against phi.
    pub values: Vec<f64>,
    /// Optional custom weights per value (must match length of values if present).
    pub weights: Option<Vec<f64>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub phi_target: f64,
    pub overall_score: f64,
    pub dimensions: Vec<DimensionScore>,
    pub verdict: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DimensionScore {
    pub index: usize,
    pub raw_value: f64,
    pub weight: f64,
    pub deviation: f64,
    pub score: f64,
}

/// Validate a set of values against the golden ratio target.
/// Each value is scored by proximity to phi: score = 1.0 - |value - phi| / phi, clamped [0,1].
/// An optional weight vector applies importance per dimension.
fn validate_against_phi(req: &ValidationRequest) -> ValidationResult {
    let n = req.values.len();
    if n == 0 {
        return ValidationResult {
            phi_target: PHI,
            overall_score: 0.0,
            dimensions: Vec::new(),
            verdict: "no values provided".to_string(),
        };
    }

    let default_weights: Vec<f64> = (0..n).map(|i| 1.0 / PHI.powi(i as i32)).collect();
    let weights = req.weights.as_ref().unwrap_or(&default_weights);
    let total_weight: f64 = weights.iter().sum();

    let mut dimensions = Vec::with_capacity(n);
    let mut weighted_sum = 0.0;

    for (i, &val) in req.values.iter().enumerate() {
        let w = weights.get(i).copied().unwrap_or(1.0);
        let deviation = (val - PHI).abs();
        let score = (1.0 - deviation / PHI).clamp(0.0, 1.0);
        weighted_sum += score * w;
        dimensions.push(DimensionScore {
            index: i,
            raw_value: val,
            weight: w,
            deviation,
            score,
        });
    }

    let overall = if total_weight > 0.0 {
        weighted_sum / total_weight
    } else {
        0.0
    };

    let verdict = if overall >= 0.95 {
        "harmonic -- aligned with phi".to_string()
    } else if overall >= 0.75 {
        "resonant -- approaching phi".to_string()
    } else if overall >= 0.50 {
        "dissonant -- drifting from phi".to_string()
    } else {
        "chaotic -- far from phi".to_string()
    };

    ValidationResult {
        phi_target: PHI,
        overall_score: overall,
        dimensions,
        verdict,
    }
}

// =============================================================================
//  Data structures -- Paper scraper stubs
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarvestedPaper {
    pub title: String,
    pub authors: Vec<String>,
    pub source: String,
    pub identifier: String,
    pub url: Option<String>,
    pub abstract_text: Option<String>,
    pub harvested_at: DateTime<Utc>,
}

/// Stub: arXiv API search.
/// When implemented, queries https://export.arxiv.org/api/query for papers.
pub async fn scrape_arxiv(query: &str) -> Vec<HarvestedPaper> {
    info!("arxiv stub called with query: {}", query);
    // TODO: implement arXiv Atom feed parsing via reqwest
    // GET https://export.arxiv.org/api/query?search_query=all:{query}&max_results=10
    Vec::new()
}

/// Stub: PubMed API search.
/// When implemented, queries https://eutils.ncbi.nlm.nih.gov/entrez/eutils/ for papers.
pub async fn scrape_pubmed(query: &str) -> Vec<HarvestedPaper> {
    info!("pubmed stub called with query: {}", query);
    // TODO: implement PubMed E-utilities esearch + efetch via reqwest
    // 1. GET https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={query}&retmode=json
    // 2. GET https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={ids}&retmode=xml
    Vec::new()
}

/// Stub: Semantic Scholar API search.
/// When implemented, queries https://api.semanticscholar.org/graph/v1/paper/search for papers.
pub async fn scrape_semantic_scholar(query: &str) -> Vec<HarvestedPaper> {
    info!("semantic_scholar stub called with query: {}", query);
    // TODO: implement Semantic Scholar search via reqwest
    // GET https://api.semanticscholar.org/graph/v1/paper/search?query={query}&limit=10&fields=title,authors,abstract,url
    Vec::new()
}

/// Stub: Unpaywall DOI resolver.
/// When implemented, queries https://api.unpaywall.org/v2/{doi} for open-access PDF links.
pub async fn resolve_unpaywall(doi: &str) -> Option<String> {
    info!("unpaywall stub called with DOI: {}", doi);
    // TODO: implement Unpaywall lookup via reqwest
    // GET https://api.unpaywall.org/v2/{doi}?email=user@example.com
    // return best_oa_location.url_for_pdf
    None
}

/// Persist harvested papers to disk as JSON.
async fn persist_papers(papers: &[HarvestedPaper]) {
    let _ = tokio::fs::create_dir_all(PAPERS_DIR).await;
    let timestamp = Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let path = format!("{}/harvest_{}.json", PAPERS_DIR, timestamp);
    match serde_json::to_string_pretty(papers) {
        Ok(json) => {
            if let Err(e) = tokio::fs::write(&path, &json).await {
                tracing::error!("failed to write papers to {}: {}", path, e);
            } else {
                info!("wrote {} papers to {}", papers.len(), path);
            }
        }
        Err(e) => tracing::error!("failed to serialize papers: {}", e),
    }
}

// =============================================================================
//  API handlers
// =============================================================================

// GET /health
#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    daemon: &'static str,
    version: &'static str,
    phi: f64,
    uptime_secs: i64,
    boot_time: DateTime<Utc>,
    request_count: u64,
}

async fn get_health(State(state): State<SharedState>) -> Json<HealthResponse> {
    let mut s = state.write().await;
    s.request_count += 1;
    let uptime = (Utc::now() - s.boot_time).num_seconds();
    Json(HealthResponse {
        status: "alive",
        daemon: "gaia",
        version: "3.0.0",
        phi: PHI,
        uptime_secs: uptime,
        boot_time: s.boot_time,
        request_count: s.request_count,
    })
}

// GET /bench
#[derive(Serialize)]
struct BenchResponse {
    timestamp: DateTime<Utc>,
    metrics: SystemMetrics,
    phi_deviation: PhiSystemDeviation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct PhiSystemDeviation {
    /// How close load_avg_1 is to phi (just for fun).
    load_phi_proximity: f64,
    /// CPU free percentage divided by 100, scored against phi-inverse.
    cpu_phi_harmony: f64,
    /// Memory usage ratio compared to 1/phi.
    mem_phi_ratio: f64,
}

async fn get_bench(State(state): State<SharedState>) -> Json<BenchResponse> {
    let mut s = state.write().await;
    s.request_count += 1;
    drop(s);

    let metrics = collect_system_metrics();

    let load_phi_proximity = 1.0 - ((metrics.load_avg_1 - PHI).abs() / PHI).min(1.0);
    let cpu_free = (100.0 - metrics.cpu_usage_percent) / 100.0;
    let phi_inv = 1.0 / PHI; // ~0.618
    let cpu_phi_harmony = 1.0 - ((cpu_free - phi_inv).abs() / phi_inv).min(1.0);
    let mem_ratio = metrics.memory_percent / 100.0;
    let mem_phi_ratio = 1.0 - ((mem_ratio - phi_inv).abs() / phi_inv).min(1.0);

    Json(BenchResponse {
        timestamp: Utc::now(),
        metrics,
        phi_deviation: PhiSystemDeviation {
            load_phi_proximity,
            cpu_phi_harmony,
            mem_phi_ratio,
        },
    })
}

// GET /metrics
#[derive(Serialize)]
struct MetricsResponse {
    timestamp: DateTime<Utc>,
    system: SystemMetrics,
    phi: f64,
    phi_cubed: f64,
    state: MetricsStateSnapshot,
}

#[derive(Serialize)]
struct MetricsStateSnapshot {
    boot_time: DateTime<Utc>,
    request_count: u64,
    papers_harvested: usize,
}

async fn get_metrics(State(state): State<SharedState>) -> Json<MetricsResponse> {
    let mut s = state.write().await;
    s.request_count += 1;
    let snapshot = MetricsStateSnapshot {
        boot_time: s.boot_time,
        request_count: s.request_count,
        papers_harvested: s.papers.len(),
    };
    drop(s);

    let system = collect_system_metrics();

    Json(MetricsResponse {
        timestamp: Utc::now(),
        system,
        phi: PHI,
        phi_cubed: PHI * PHI * PHI,
        state: snapshot,
    })
}

// POST /validate
async fn post_validate(
    State(state): State<SharedState>,
    Json(req): Json<ValidationRequest>,
) -> Json<ValidationResult> {
    let mut s = state.write().await;
    s.request_count += 1;
    drop(s);

    Json(validate_against_phi(&req))
}

// =============================================================================
//  Scraper endpoint (for demonstration / future use)
// =============================================================================

#[derive(Debug, Deserialize)]
struct ScrapeRequest {
    query: String,
    sources: Option<Vec<String>>,
}

#[derive(Serialize)]
struct ScrapeResponse {
    query: String,
    sources_queried: Vec<String>,
    total_results: usize,
    papers: Vec<HarvestedPaper>,
    note: String,
}

async fn post_scrape(
    State(state): State<SharedState>,
    Json(req): Json<ScrapeRequest>,
) -> Json<ScrapeResponse> {
    let default_sources = vec![
        "arxiv".to_string(),
        "pubmed".to_string(),
        "semantic_scholar".to_string(),
    ];
    let sources = req.sources.unwrap_or(default_sources);

    let mut all_papers: Vec<HarvestedPaper> = Vec::new();
    let mut queried: Vec<String> = Vec::new();

    for source in &sources {
        match source.as_str() {
            "arxiv" => {
                queried.push("arxiv".to_string());
                let papers = scrape_arxiv(&req.query).await;
                all_papers.extend(papers);
            }
            "pubmed" => {
                queried.push("pubmed".to_string());
                let papers = scrape_pubmed(&req.query).await;
                all_papers.extend(papers);
            }
            "semantic_scholar" => {
                queried.push("semantic_scholar".to_string());
                let papers = scrape_semantic_scholar(&req.query).await;
                all_papers.extend(papers);
            }
            other => {
                queried.push(format!("{} (unknown)", other));
            }
        }
    }

    // Persist if we got anything
    if !all_papers.is_empty() {
        persist_papers(&all_papers).await;
    }

    // Store in state
    {
        let mut s = state.write().await;
        s.request_count += 1;
        s.papers.extend(all_papers.clone());
    }

    Json(ScrapeResponse {
        query: req.query,
        sources_queried: queried,
        total_results: all_papers.len(),
        papers: all_papers,
        note: "scraper modules are stubs -- implement HTTP calls to activate".to_string(),
    })
}

// =============================================================================
//  Main
// =============================================================================

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_target(false)
        .compact()
        .init();

    println!(
        r#"
    =====================================================
      GAIA v3.0 - La Terre
      Pantheon Ground Truth -- Benchmarking Daemon
      phi = {}
      phi^3 = {:.3} -- niveau 4 du GOLEM (cell)
      Port: {}
      According to Nyx Daemon
    =====================================================
    "#,
        PHI,
        PHI * PHI * PHI,
        PORT,
    );

    // Ensure data directories exist
    let _ = tokio::fs::create_dir_all(DATA_DIR).await;
    let _ = tokio::fs::create_dir_all(PAPERS_DIR).await;

    let state: SharedState = Arc::new(RwLock::new(AppState::default()));

    // CORS layer -- allow all origins for development
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(get_health))
        .route("/bench", get(get_bench))
        .route("/metrics", get(get_metrics))
        .route("/validate", post(post_validate))
        .route("/scrape", post(post_scrape))
        .layer(cors)
        .with_state(state);

    let addr = format!("0.0.0.0:{}", PORT);
    info!("gaia API listening on http://{}", addr);

    let listener = TcpListener::bind(&addr)
        .await
        .expect("failed to bind port");

    axum::serve(listener, app).await.expect("server error");
}

// =============================================================================
//  Tests
// =============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn phi_constant_is_correct() {
        let computed = (1.0 + 5.0_f64.sqrt()) / 2.0;
        assert!((PHI - computed).abs() < 1e-12);
    }

    #[test]
    fn validate_perfect_phi() {
        let req = ValidationRequest {
            values: vec![PHI, PHI, PHI],
            weights: None,
        };
        let result = validate_against_phi(&req);
        assert!((result.overall_score - 1.0).abs() < 1e-12);
        assert!(result.verdict.contains("harmonic"));
    }

    #[test]
    fn validate_zero_values() {
        let req = ValidationRequest {
            values: vec![0.0, 0.0],
            weights: None,
        };
        let result = validate_against_phi(&req);
        assert!(result.overall_score < 0.01);
        assert!(result.verdict.contains("chaotic"));
    }

    #[test]
    fn validate_empty() {
        let req = ValidationRequest {
            values: vec![],
            weights: None,
        };
        let result = validate_against_phi(&req);
        assert_eq!(result.overall_score, 0.0);
        assert_eq!(result.dimensions.len(), 0);
    }

    #[test]
    fn validate_custom_weights() {
        let req = ValidationRequest {
            values: vec![PHI, 0.0],
            weights: Some(vec![10.0, 0.001]),
        };
        let result = validate_against_phi(&req);
        // Heavily weighted toward the perfect value, so score should be near 1.0
        assert!(result.overall_score > 0.99);
    }

    #[test]
    fn system_metrics_collect() {
        let m = collect_system_metrics();
        assert!(m.cpu_count > 0);
        assert!(m.memory_total_mb > 0);
    }
}
