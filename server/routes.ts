import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { parseResumeFile } from "./services/fileParser";
import { generateResumePDF, generateResumeHTML } from "./services/pdfGenerator";
import { insertResumeSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  },
});

// Simple authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Resume routes
  app.get('/api/resumes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const resumes = await storage.getUserResumes(userId);
      res.json(resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  app.get('/api/resumes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const resume = await storage.getResume(resumeId);
      
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      // Check if user owns this resume
      if (resume.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(resume);
    } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).json({ message: "Failed to fetch resume" });
    }
  });

  app.post('/api/resumes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const resumeData = insertResumeSchema.parse({
        ...req.body,
        userId,
      });
      
      const resume = await storage.createResume(resumeData);
      res.status(201).json(resume);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resume data", errors: error.errors });
      }
      console.error("Error creating resume:", error);
      res.status(500).json({ message: "Failed to create resume" });
    }
  });

  app.put('/api/resumes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if resume exists and user owns it
      const existingResume = await storage.getResume(resumeId);
      if (!existingResume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      if (existingResume.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updateData = insertResumeSchema.partial().parse(req.body);
      const updatedResume = await storage.updateResume(resumeId, updateData);
      res.json(updatedResume);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resume data", errors: error.errors });
      }
      console.error("Error updating resume:", error);
      res.status(500).json({ message: "Failed to update resume" });
    }
  });

  app.delete('/api/resumes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if resume exists and user owns it
      const existingResume = await storage.getResume(resumeId);
      if (!existingResume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      if (existingResume.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteResume(resumeId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting resume:", error);
      res.status(500).json({ message: "Failed to delete resume" });
    }
  });

  // File upload and parsing
  app.post('/api/resumes/parse', isAuthenticated, upload.single('resume'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const parsedData = await parseResumeFile(req.file.buffer, req.file.mimetype);
      
      // Get the first available template as default
      const templates = await storage.getTemplates();
      const defaultTemplate = templates[0];
      
      if (!defaultTemplate) {
        return res.status(500).json({ message: "No templates available" });
      }
      
      // Create a new resume with parsed data
      const userId = req.user.id;
      const resumeData = insertResumeSchema.parse({
        ...parsedData,
        userId,
        templateId: defaultTemplate.id, // Use first available template as default
        title: parsedData.fullName ? `${parsedData.fullName}'s Resume` : 'Parsed Resume',
      });
      
      const resume = await storage.createResume(resumeData);
      res.status(201).json(resume);
    } catch (error) {
      console.error("Error parsing resume file:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to parse resume file" 
      });
    }
  });

  // Template routes
  app.get('/api/templates', async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get('/api/templates/:id', async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // PDF generation
  // Preview resume as HTML
  app.get("/api/resumes/:id/preview", isAuthenticated, async (req: any, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const userId = req.user.id;
      const templateId = req.query.templateId ? parseInt(req.query.templateId as string) : undefined;
      
      if (isNaN(resumeId)) {
        return res.status(400).json({ message: "Invalid resume ID" });
      }
      
      const resume = await storage.getResume(resumeId);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      if (resume.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      let template;
      if (templateId) {
        template = await storage.getTemplate(templateId);
      } else if (resume.templateId) {
        template = await storage.getTemplate(resume.templateId);
      }
      
      if (!template) {
        // Use a default template if none specified
        const templates = await storage.getTemplates();
        template = templates[0];
      }
      
      if (!template) {
        return res.status(400).json({ message: "No template available" });
      }
      
      // Generate HTML preview
      const htmlContent = await generateResumeHTML(resume, template);
      
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    } catch (error) {
      console.error("Error generating HTML preview:", error);
      res.status(500).json({ 
        message: "Failed to generate preview",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post('/api/resumes/:id/download', isAuthenticated, async (req: any, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const userId = req.user.id;
      const { templateId } = req.body || {};
      
      // Get resume and check ownership
      const resume = await storage.getResume(resumeId);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      if (resume.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get template - prioritize templateId from request body
      let template;
      if (templateId) {
        template = await storage.getTemplate(templateId);
      } else if (resume.templateId) {
        template = await storage.getTemplate(resume.templateId);
      }
      
      if (!template) {
        // Use a default template if none specified
        const templates = await storage.getTemplates();
        template = templates[0];
      }
      
      if (!template) {
        return res.status(400).json({ message: "No template available" });
      }
      
      // Generate PDF
      const pdfBuffer = await generateResumePDF(resume, template);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${resume.title || 'resume'}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      if (error instanceof SyntaxError) {
        return res.status(400).json({ message: "Invalid request body" });
      }
      res.status(500).json({ 
        message: "Failed to generate PDF",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
