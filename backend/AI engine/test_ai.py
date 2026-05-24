from goal_prompt import extract_goal
from task_prompt import generate_tasks

goal = extract_goal("عايز أتعلم AI")

print(goal)

tasks = generate_tasks(goal["main_goal"])

print(tasks)