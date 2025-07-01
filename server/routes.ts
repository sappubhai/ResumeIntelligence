import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { parseResumeFile } from "./services/fileParser";
import { generateResumePDF } from "./services/pdfGenerator";
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Resume routes
  app.get('/api/resumes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      if (resume.userId !== req.user.claims.sub) {
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
  app.post('/api/resumes/:id/download', isAuthenticated, async (req: any, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Get resume and check ownership
      const resume = await storage.getResume(resumeId);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      if (resume.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get template
      let template;
      if (resume.templateId) {
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
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
