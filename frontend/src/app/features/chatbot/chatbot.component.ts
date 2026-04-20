import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ChatbotService, Message } from '../../core/services/chatbot.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('inputField') private inputField!: ElementRef;

  messages: Message[] = [];
  userInput = '';
  isOpen = false;
  unreadCount = 0;

  private sub!: Subscription;
  private shouldScroll = false;

  constructor(
    private chatbotService: ChatbotService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.sub = this.chatbotService.messages$.subscribe(msgs => {
      // Compter les messages non lus quand le chat est fermé
      if (!this.isOpen && msgs.length > this.messages.length) {
        const newMsgs = msgs.slice(this.messages.length);
        this.unreadCount += newMsgs.filter(m => !m.isUser && !m.isLoading).length;
      }
      this.messages = msgs;
      this.shouldScroll = true;
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
      this.shouldScroll = true;
      setTimeout(() => this.inputField?.nativeElement?.focus(), 300);
    }
  }

  sendMessage(): void {
    const msg = this.userInput.trim();
    if (!msg) return;
    this.userInput = '';
    this.chatbotService.sendMessage(msg);
  }

  quickSend(text: string): void {
    this.userInput = text;
    this.sendMessage();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    this.chatbotService.clearMessages();
  }

  formatMessage(text: string): SafeHtml {
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
