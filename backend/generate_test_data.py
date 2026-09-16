import os

sample_records = {
    "PRD_Database_Migration.txt": """
Project: Core Infrastructure Upgrade
Author: Sarah Jenkins
Date: October 14

During the engineering review meeting, Sarah Jenkins proposed replacing MongoDB with PostgreSQL. 
The team agreed and approved the migration to PostgreSQL to ensure ACID compliance for transaction logging.
    """,
    
    "Architecture_Pivot_Log.txt": """
Project: Institutional Memory Platform
Author: Alex Rivera
Date: November 02

Alex Rivera evaluated vector databases for natural language retrieval.
After testing FAISS and Pinecone, Alex decided to implement FAISS locally for vector similarity search.
    """,
    
    "Security_Audit_Report.txt": """
Project: Compliance Review
Author: David Chen
Date: December 05

David Chen conducted a security audit of the API endpoints.
It was decided to mandate OAuth2 bearer token authentication across all microservices starting next sprint.
    """
}

def generate_files():
    data_dir = "sample_data"
    os.makedirs(data_dir, exist_ok=True)
    
    for filename, content in sample_records.items():
        filepath = os.path.join(data_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content.strip())
        print(f"Generated sample document: {filepath}")

if __name__ == "__main__":
    generate_files()