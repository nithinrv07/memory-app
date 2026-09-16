import spacy
import uuid
from typing import List, Tuple
from schemas import EntityNode, KnowledgeEdge

nlp = spacy.load("en_core_web_sm")

class KnowledgeGraphBuilder:
    def __init__(self):
        pass

    def extract_triples(self, text: str, filename: str) -> Tuple[List[EntityNode], List[KnowledgeEdge]]:
        doc = nlp(text)
        nodes = []
        edges = []
        
        # 1. Root Document Node
        doc_id = f"doc_{uuid.uuid4().hex[:8]}"
        doc_node = EntityNode(id=doc_id, label=filename, type="Document")
        nodes.append(doc_node)

        # 2. Extract Named Entities (People, Dates/Events)
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                person_id = f"person_{uuid.uuid4().hex[:8]}"
                person_node = EntityNode(id=person_id, label=ent.text, type="Person")
                nodes.append(person_node)
                edges.append(KnowledgeEdge(
                    id=f"e_{uuid.uuid4().hex[:6]}",
                    source=doc_id,
                    target=person_id,
                    relation="authored_by"
                ))
            elif ent.label_ in ["DATE", "EVENT"]:
                event_id = f"event_{uuid.uuid4().hex[:8]}"
                event_node = EntityNode(id=event_id, label=ent.text, type="Event")
                nodes.append(event_node)
                edges.append(KnowledgeEdge(
                    id=f"e_{uuid.uuid4().hex[:6]}",
                    source=doc_id,
                    target=event_id,
                    relation="occurred_at"
                ))

        # 3. Extract Decision Sentences (Keyword Heuristics)
        sentences = [sent.text.strip() for sent in doc.sents]
        for sent in sentences:
            if any(kw in sent.lower() for kw in ["decided", "approved", "agreed", "selected", "pivoted"]):
                dec_id = f"dec_{uuid.uuid4().hex[:8]}"
                dec_node = EntityNode(id=dec_id, label=sent[:60] + "...", type="Decision", metadata={"full_text": sent})
                nodes.append(dec_node)
                edges.append(KnowledgeEdge(
                    id=f"e_{uuid.uuid4().hex[:6]}",
                    source=doc_id,
                    target=dec_id,
                    relation="contains_decision"
                ))

        return nodes, edges
        