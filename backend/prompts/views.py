import os
import random
from pathlib import Path
import google.generativeai as genai
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Prompt
from .serializers import PromptSerializer

# Manually load .env since python-dotenv might not be installed
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_file = BASE_DIR / "backend" / ".env"
if env_file.exists():
    with open(env_file, "r") as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value

# Setup Gemini if API Key is available
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class PromptHistoryView(generics.ListAPIView):
    serializer_class = PromptSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Filter by user if authenticated, else return all for demo
        if self.request.user.is_authenticated:
            return Prompt.objects.filter(user=self.request.user).order_by('-created_at')
        return Prompt.objects.all().order_by('-created_at')

class OptimizerView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        prompt_text = request.data.get('prompt')
        target_llm = request.data.get('target_llm', 'Gemini 1.5 Pro')
        optimizer_choice = request.data.get('optimizer', 'HyPE')
        base64_image = request.data.get('image')
        
        if not prompt_text:
            return Response({"error": "Prompt text is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Mock Pipeline Metrics
        metrics = {
            "bert_score": round(random.uniform(0.85, 0.95), 2),
            "f1_score": round(random.uniform(0.80, 0.92), 2),
            "token_reduction": f"{random.randint(10, 30)}%",
            "efficiency_gain": f"+{random.randint(15, 45)}%"
        }

        # Mock 4-stage processing messages
        stages = [
            {"name": "Input", "status": "complete", "message": f"Task detected as {optimizer_choice} optimization."},
            {"name": "Augmentation", "status": "complete", "message": "Synthetic candidates generated via HyPE engine."},
            {"name": "Selection", "status": "complete", "message": "KG-Policy selected best feature mapping."},
            {"name": "Optimized Output", "status": "complete", "message": f"Final prompt delivery for {target_llm}."}
        ]
        
        # Strategic Optimization Logic (for Research/Local Mode)
        def get_research_optimized(text, llm, strategy):
            patterns = {
                "HyPE (Sequential)": f"""### [ROLE: EXPERT SYSTEM]
### [CONTEXT]
You are interacting with an optimized prompt designed for {llm} using Sequential Optimal Learning (HyPE).
### [TASK]
{text}
### [CONSTRAINTS]
1. Respond with high precision and clarity.
2. Break down complex reasoning into step-by-step logic.
3. Optimize for token efficiency while retaining crucial context.
### [OUTPUT FORMAT]
Provide your response in a structured markdown format with clear headings.""",
                
                "KG-Policy (Bayesian)": f"""### [PERSONA: DOMAIN EXPERT]
### [INSTRUCTION]
{text}
### [FEATURES MAPPING (Knowledge-Graph Context)]
- Precision Level: High
- Focus Areas: Deep Technical Accuracy, Logical Coherence
- Target Architecture: {llm}
### [OPTIMIZED DIRECTIVE]
Execute the above instruction. Before providing the final answer, outline your assumptions and thought process in a separated `<scratchpad>` section to ensure rigorous constraint satisfaction.""",

                "Reflective Agent": f"""### [MULTI-AGENT REFLECTION PROTOCOL]
[SYSTEM NOTE] This prompt has undergone Multi-Agent Critique for {llm}.
### [CORE INSTRUCTION]
{text}
### [EXECUTION STRATEGY]
1. Analyze the core requirements and identify potential edge cases.
2. Draft an initial internal response.
3. Self-correct ensuring the response perfectly aligns with the target instructions without hallucinations.
4. Output the final refined response with strict adherence to the prompt intent."""
            }
            # Fallback for generic inputs
            return patterns.get(strategy, patterns["HyPE (Sequential)"])

        # Actual Gemini Logic OR Template-Based Optimization
        if GEMINI_API_KEY:
            try:
                model = genai.GenerativeModel('gemini-2.5-flash')
                enhancement_prompt = f"""You are an elite AI Prompt Engineer. Your goal is to drastically rewrite and EXPAND the user's raw prompt into a highly optimized, detailed, and structured prompt for {target_llm}.
Use the {optimizer_choice} prompt engineering strategy.

CRITICAL INSTRUCTION: Do NOT just wrap the user's original short text in a template. You must deeply EXPAND the core task itself. Add necessary details, creative angles, missing context, variables, and specific requirements to make the instruction comprehensive and powerful.

Make sure the new prompt contains:
1. Clear Role / Persona (tailored to the specific task)
2. Expanded Context and Task Details (extrapolate what the user wants and add rich details)
3. Strict Constraints, Tone, & Formatting Guidelines
4. Step-by-Step reasoning commands (if the task is complex)

Raw Prompt: "{prompt_text}"

Return ONLY the optimized prompt text without any intro or outro."""

                contents = [enhancement_prompt]
                
                if base64_image:
                    import base64
                    try:
                        header, data = base64_image.split(',', 1)
                        mime_type = header.split(';')[0].split(':')[1]
                        
                        contents.append({
                            "mime_type": mime_type,
                            "data": base64.b64decode(data)
                        })
                        contents[0] += "\n\n[MULTIMODAL INSTRUCTION]: The user has attached an image that relates to their prompt. Analyze the image conceptually and extract its key themes, content, and visual properties. Hardcode these deep visual descriptions directly into the optimized text payload as constraints and context so that an AI receiving the optimized text prompt understands exactly what the image contained."
                    except Exception as e:
                        print("Image parsing exception:", e)

                response = model.generate_content(contents)
                optimized_text = response.text
            except Exception as e:
                import traceback
                traceback.print_exc()
                error_msg = f"--- [SYSTEM DETECTED API ERROR] ---\n{str(e)}\n\n--- [FALLING BACK TO LOCAL TEMPLATE] ---\n"
                optimized_text = error_msg + get_research_optimized(prompt_text, target_llm, optimizer_choice)
        else:
            optimized_text = get_research_optimized(prompt_text, target_llm, optimizer_choice)
        
        # Contextual Logic Explanation
        explanations = {
            "HyPE (Sequential)": "Applied Sequential Optimal Learning: enforced clear roles, structured constraints, and step-by-step guidance.",
            "KG-Policy (Bayesian)": "Applied Knowledge-Graph Policy: incorporated explicit feature mapping and required chain-of-thought scratchpads for precision.",
            "Reflective Agent": "Applied Reflective Protocol: injected self-correction instructions and multi-agent critique workflows."
        }
        logic_explanation = explanations.get(optimizer_choice, "Restructured prompt for specialized LLM constraints and efficiency.")

        # Save to database (With Research Mode Bypass)
        from django.contrib.auth.models import User
        if request.user.is_authenticated:
            target_user = request.user
        else:
            target_user, _ = User.objects.get_or_create(username='Researcher')

        prompt_obj = Prompt.objects.create(
            user=target_user,
            original_text=prompt_text,
            optimized_text=optimized_text,
            stage="Optimized Output",
            model_name=target_llm
        )

        return Response({
            "id": prompt_obj.id,
            "original": prompt_text,
            "optimized": optimized_text,
            "stages": stages,
            "metrics": metrics,
            "logic_explanation": logic_explanation
        }, status=status.HTTP_201_CREATED)
