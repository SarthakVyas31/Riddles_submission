"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { submitRiddle } from "@/app/actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  topic: z.string().min(1, "Please select a topic"),
  topicDetails: z.string().optional(),
  riddle: z.string().min(10, "Riddle must be at least 10 characters"),
  answer: z.string().min(1, "Answer is required"),
}).refine((data) => {
  if (data.topic === "Others" && (!data.topicDetails || data.topicDetails.length < 2)) {
    return false;
  }
  return true;
}, {
  message: "Please specify the topic",
  path: ["topicDetails"],
});

const TOPICS = [
  "Micro Economics",
  "Macro Economics",
  "Accountancy",
  "Finance",
  "Others",
];

export function RiddleForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      topic: "",
      topicDetails: "",
      riddle: "",
      answer: "",
    },
  });

  const selectedTopic = form.watch("topic");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("topic", values.topic === "Others" ? (values.topicDetails || "Other") : values.topic);
    formData.append("riddle", values.riddle);
    formData.append("answer", values.answer);

    const result = await submitRiddle(formData);

    if (result.success) {
      toast.success("Riddle submitted", {
        position: "bottom-right",
      });
      form.reset();
    } else {
      toast.error(result.error || "Failed to submit riddle");
    }
    setIsSubmitting(false);
  }

  return (
    <Card className="w-full max-w-lg border-2 border-primary/10 shadow-xl">
      <CardHeader className="space-y-1 bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-center">Submit a Riddle</CardTitle>
        <CardDescription className="text-primary-foreground/80 text-center">
          Share your cleverest riddles with us!
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topic"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Riddle Topic</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TOPICS.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedTopic === "Others" && (
              <FormField
                control={form.control}
                name="topicDetails"
                render={({ field }: { field: any }) => (
                  <FormItem className="animate-in fade-in slide-in-from-top-2">
                    <FormLabel>Specify Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Marketing, Statistics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="riddle"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Riddle</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What has keys but can't open locks?..." 
                      className="min-h-[100px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Answer</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="The answer is..." 
                      className="min-h-[60px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-11 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Riddle"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
