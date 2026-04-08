use fred::prelude::*;
use serde::{Deserialize, Serialize};
use crate::processor;
use crate::ax_status::StatusMap;

#[derive(Serialize, Deserialize, Debug)]
pub struct VideoTask {
    pub video_id: String,
    pub task_id: String,
    pub target_format: String, // "home" or "flash"
}

pub async fn start_worker(redis_url: &str, status_map: StatusMap) -> Result<(), RedisError> {
    println!("Starting Redis worker on queue: video_tasks");
    
    let config = RedisConfig::from_url(redis_url)?;
    let client = RedisClient::new(config, None, None, None);
    
    client.connect();
    client.wait_for_connect().await?;
    
    // Create a scan stream or just use a loop with BRPOP
    // BRPOP is better for a real queue
    loop {
        // BRPOP returns [key, value]
        let result: Option<(String, String)> = client.brpop("video_tasks", 30.0).await?;
        
        if let Some((_key, val)) = result {
            let task_json = &val;
            
            match serde_json::from_str::<VideoTask>(task_json) {
                Ok(task) => {
                    println!("Received task from Redis: {:?}", task);
                    let status_map_clone = status_map.clone();
                    
                    // Spawn processing task
                    tokio::spawn(async move {
                        let video_id = task.video_id.clone();
                        let task_id = task.task_id.clone();
                        
                        match processor::process(&video_id, &task.target_format, false, Some(status_map_clone.clone()), task_id.clone()).await {
                            Ok(_) => {
                                println!("Successfully processed task: {}", task_id);
                            },
                            Err(e) => {
                                eprintln!("Error processing task {}: {}", task_id, e);
                            }
                        }
                    });
                },
                Err(e) => {
                    eprintln!("Failed to parse task JSON: {}", e);
                }
            }
        }
    }
}
