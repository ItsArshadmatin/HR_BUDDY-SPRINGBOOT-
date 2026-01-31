from fpdf import FPDF
import sys

# Check if fpdf is installed, if not, exit with instructions (?) 
# Actually, I'll assume the agent will install it.

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'John Doe - Senior Java Developer', 0, 1, 'C')
        self.ln(5)

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 6, title, 0, 1, 'L', 1)
        self.ln(4)

    def chapter_body(self, body):
        self.set_font('Arial', '', 11)
        self.multi_cell(0, 5, body)
        self.ln()

pdf = PDF()
pdf.add_page()

# Contact Info
pdf.set_font('Arial', '', 10)
pdf.cell(0, 5, 'Email: john.doe@example.com | Phone: (555) 010-9988 | Location: San Francisco, CA', 0, 1, 'C')
pdf.ln(10)

# Summary
pdf.chapter_title('Professional Summary')
pdf.chapter_body(
    "Results-oriented Senior Software Engineer with 7+ years of experience designing and deploying scalable "
    "microservices architectures. Expert in Java ecosystem (Spring Boot, Hibernate) and cloud-native solutions "
    "(AWS, Docker, Kubernetes). Proven track record of optimizing system performance and leading agile teams. "
    "Passionate about clean code and TDD."
)

# Skills
pdf.chapter_title('Technical Skills')
pdf.chapter_body(
    "Languages: Java 17, Python, JavaScript (ES6+), SQL\n"
    "Frameworks: Spring Boot 3, Spring Cloud, React.js, Hibernate, JUnit\n"
    "Cloud & DevOps: AWS (EC2, S3, Lambda), Docker, Kubernetes, Jenkins, GitHub Actions\n"
    "Databases: PostgreSQL, MySQL, MongoDB, Redis\n"
    "Tools: IntelliJ IDEA, JIRA, Postman, Git"
)

# Experience
pdf.chapter_title('Work Experience')
pdf.set_font('Arial', 'B', 11)
pdf.cell(0, 6, 'TechFlow Solutions | Senior Java Engineer | 2020 - Present', 0, 1)
pdf.chapter_body(
    "- Architected and built a payment processing gateway using Spring Boot and Kafka, handling 10k+ tps.\n"
    "- Migrated legacy monolithic applications to microservices on AWS EKS, reducing deployment time by 60%.\n"
    "- Mentored 4 junior developers and established code review guidelines."
)

pdf.set_font('Arial', 'B', 11)
pdf.cell(0, 6, 'Innovate Corp | Software Developer | 2017 - 2020', 0, 1)
pdf.chapter_body(
    "- Developed RESTful APIs for the company's flagship CRM product using Java and Spring MVC.\n"
    "- Integrated UI components using React.js and Redux, improving user engagement by 25%.\n"
    "- Optimized database queries in MySQL, improving report generation speed by 40%."
)

# Education
pdf.chapter_title('Education')
pdf.chapter_body(
    "Bachelor of Science in Computer Science\n"
    "University of California, Berkeley | 2013 - 2017"
)

output_path = "Sample_Resume_Java_Dev.pdf"
pdf.output(output_path)
print(f"PDF Generated: {output_path}")
