import { Component, Inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { TransactionService, TransactionType } from '../../services/transaction.service';
import { Child } from '../child-registration-modal/child-registration-modal.component';

export interface RewardModalData {
  familyId: string;
  children: Child[];
  selectedChildId?: string;
}

export enum RewardType {
  CHORES = 'CHORES',
  GOOD_BEHAVIOR = 'GOOD_BEHAVIOR', 
  ACHIEVEMENT = 'ACHIEVEMENT',
  SPECIAL_OCCASION = 'SPECIAL_OCCASION',
  HELPING_OTHERS = 'HELPING_OTHERS',
  SCHOOL_SUCCESS = 'SCHOOL_SUCCESS'
}

// Danish reward types with detailed descriptions
export const DANISH_REWARD_TYPES = {
  [RewardType.CHORES]: {
    name: 'Husarbejde',
    icon: '🧹',
    color: '#7fb069',
    description: 'For hjælp med rengøring og husarbejde',
    examples: ['Støvsugning', 'Opvask', 'Rydde op på værelset', 'Tøj i vask']
  },
  [RewardType.GOOD_BEHAVIOR]: {
    name: 'God Opførsel',
    icon: '😇',
    color: '#6ba3d6',
    description: 'For eksemplarisk opførsel og venlighed',
    examples: ['Hjælpe søskende', 'Være høflig', 'Følge regler', 'Vise respekt']
  },
  [RewardType.ACHIEVEMENT]: {
    name: 'Præstation',
    icon: '🏆',
    color: '#d4944a',
    description: 'For særlige præstationer og målsætninger',
    examples: ['Færdige projekter', 'Personlige mål', 'Kreative resultater', 'Udfordringer']
  },
  [RewardType.SPECIAL_OCCASION]: {
    name: 'Særlig Lejlighed',
    icon: '🎉',
    color: '#e67e52',
    description: 'For særlige begivenheder og fejringer',
    examples: ['Fødselsdag', 'Gode karakterer', 'Afsluttede kurser', 'Helligdage']
  },
  [RewardType.HELPING_OTHERS]: {
    name: 'Hjælpe Andre',
    icon: '❤️',
    color: '#d65d7a',
    description: 'For venlighed og hjælpsomhed over for andre',
    examples: ['Hjælpe venner', 'Være en god kammerat', 'Dele legetøj', 'Trøste andre']
  },
  [RewardType.SCHOOL_SUCCESS]: {
    name: 'Skole Succes',
    icon: '📚',
    color: '#8e7cc3',
    description: 'For flid og fremskridt i skolen',
    examples: ['Gode karakterer', 'Aflever opgaver', 'Deltage aktivt', 'Læse lektier']
  }
};

@Component({
  selector: 'app-reward-modal',
  standalone: false,
  templateUrl: './reward-modal.component.html',
  styleUrl: './reward-modal.component.scss',
  animations: [
    trigger('celebration', [
      state('hidden', style({ opacity: 0, transform: 'scale(0.3)' })),
      state('visible', style({ opacity: 1, transform: 'scale(1)' })),
      transition('hidden => visible', [
        animate('0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)')
      ])
    ]),
    trigger('confetti', [
      state('hidden', style({ opacity: 0, transform: 'translateY(100px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', [
        animate('0.8s ease-out', keyframes([
          style({ opacity: 0, transform: 'translateY(100px)', offset: 0 }),
          style({ opacity: 1, transform: 'translateY(-20px)', offset: 0.7 }),
          style({ opacity: 1, transform: 'translateY(0)', offset: 1 })
        ]))
      ])
    ]),
    trigger('sparkle', [
      state('hidden', style({ opacity: 0, transform: 'scale(0) rotate(0deg)' })),
      state('visible', style({ opacity: 1, transform: 'scale(1) rotate(360deg)' })),
      transition('hidden => visible', [
        animate('1s cubic-bezier(0.68, -0.55, 0.265, 1.55)')
      ])
    ])
  ]
})
export class RewardModalComponent implements OnInit, AfterViewInit {
  @ViewChild('confettiCanvas', { static: false }) confettiCanvas!: ElementRef<HTMLCanvasElement>;
  
  rewardForm: FormGroup;
  isSubmitting = false;
  showCelebration = false;
  celebrationMessage = '';
  selectedRewardType: RewardType = RewardType.GOOD_BEHAVIOR;

  // Available reward types
  rewardTypes = Object.entries(DANISH_REWARD_TYPES).map(([key, value]) => ({
    type: key as RewardType,
    ...value
  }));

  // Quick amounts specifically for rewards
  quickAmounts = [25, 50, 75, 100, 150, 200];

  // Pre-defined reward descriptions by type
  rewardDescriptions: Record<RewardType, string[]> = {
    [RewardType.CHORES]: [
      'Støvsugede hele stuen', 'Hjalp med opvask', 'Ryddede værelset perfekt', 
      'Hjalp med vasketøj', 'Støvsugede trappen', 'Rengøring af badeværelse'
    ],
    [RewardType.GOOD_BEHAVIOR]: [
      'Var ekstra sød ved lillesøster', 'Hjalp en ven i nød', 'Sagde undskyld af sig selv',
      'Delte legetøj villigt', 'Viste god bordskik', 'Var høflig hele dagen'
    ],
    [RewardType.ACHIEVEMENT]: [
      'Gennemførte svømmetræning', 'Læste en hel bog', 'Færdiggjorde puslespil',
      'Lærte at cykle', 'Mestrede matematikopgaver', 'Afsluttede kunstprojekt'
    ],
    [RewardType.SPECIAL_OCCASION]: [
      'Fantastisk fødselsdag!', 'Flotte karakterer på vidnesbyrd', 'Bestod musikeksamen',
      'Vandt konkurrence', 'Afsluttede sæson i sport', 'Jul og nytår bonus'
    ],
    [RewardType.HELPING_OTHERS]: [
      'Hjalp en klassekammerat', 'Passede på lillebror', 'Hjalp bedstemor',
      'Var sød ved det nye barn', 'Trøstede en ven', 'Delte frokost'
    ],
    [RewardType.SCHOOL_SUCCESS]: [
      'Fantastisk matematik prøve', 'Læste lektier uden påmindelse', 
      'Deltog aktivt i timen', 'Hjalp andre med opgaver', 'Perfekt fremmøde hele ugen'
    ]
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RewardModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RewardModalData,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) {
    this.rewardForm = this.fb.group({
      childId: [this.data.selectedChildId || '', Validators.required],
      amount: [50, [Validators.required, Validators.min(1), Validators.max(10000)]],
      rewardType: [RewardType.GOOD_BEHAVIOR, Validators.required],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      customReason: ['', [Validators.maxLength(300)]]
    });
  }

  ngOnInit(): void {
    // Auto-update description when reward type changes
    this.rewardForm.get('rewardType')?.valueChanges.subscribe(rewardType => {
      this.selectedRewardType = rewardType;
      this.updateDescriptionSuggestion();
    });

    // Initial description
    this.updateDescriptionSuggestion();
  }

  ngAfterViewInit(): void {
    // Initialize confetti canvas if available
    if (this.confettiCanvas) {
      this.setupConfettiCanvas();
    }
  }

  private updateDescriptionSuggestion(): void {
    const selectedType = DANISH_REWARD_TYPES[this.selectedRewardType];
    const descriptions = this.rewardDescriptions[this.selectedRewardType];
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    this.rewardForm.patchValue({
      description: randomDescription
    });
  }

  setQuickAmount(amount: number): void {
    this.rewardForm.patchValue({ amount });
  }

  setRewardType(type: RewardType): void {
    this.rewardForm.patchValue({ rewardType: type });
  }

  getSelectedTypeInfo() {
    return DANISH_REWARD_TYPES[this.selectedRewardType];
  }

  getChildName(childId: string): string {
    const child = this.data.children.find(c => c.id === childId);
    return child?.name || 'Ukendt barn';
  }

  // Get random celebration message
  private getCelebrationMessage(childName: string, amount: number, rewardType: RewardType): string {
    const typeInfo = DANISH_REWARD_TYPES[rewardType];
    const messages = [
      `🎉 Tillykke ${childName}! Du har fortjent ${amount} DKK!`,
      `${typeInfo.icon} Fantastisk arbejde ${childName}! ${amount} DKK til dig!`,
      `🌟 Godt gået ${childName}! Du får ${amount} DKK som belønning!`,
      `🎊 ${childName}, du er en stjerne! ${amount} DKK er på vej!`,
      `✨ Så stolt af dig ${childName}! Her er ${amount} DKK!`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  onSubmit(): void {
    if (this.rewardForm.valid) {
      this.isSubmitting = true;
      
      const formData = this.rewardForm.value;
      const childName = this.getChildName(formData.childId);

      // Create the description with custom reason if provided
      let finalDescription = formData.description;
      if (formData.customReason?.trim()) {
        finalDescription += ` - ${formData.customReason}`;
      }
      
      this.transactionService.createRewardTransaction(
        formData.childId,
        this.data.familyId,
        Number(formData.amount),
        finalDescription
      ).subscribe({
        next: (transaction) => {
          // Show celebration
          this.celebrationMessage = this.getCelebrationMessage(
            childName, 
            formData.amount, 
            formData.rewardType
          );
          this.showCelebration = true;
          
          // Start confetti animation
          this.startConfettiAnimation();
          
          // Success notification
          this.snackBar.open(
            `${DANISH_REWARD_TYPES[formData.rewardType as RewardType].icon} ${formData.amount} DKK belønning givet til ${childName}!`,
            'Fantastisk!',
            { 
              duration: 5000,
              panelClass: ['celebration-snackbar']
            }
          );
          
          // Close modal after celebration
          setTimeout(() => {
            this.dialogRef.close(transaction);
          }, 3000);
        },
        error: (error) => {
          console.error('Error creating reward transaction:', error);
          this.snackBar.open(
            'Der opstod en fejl ved belønning 😔',
            'Luk',
            { 
              duration: 4000,
              panelClass: ['error-snackbar']
            }
          );
          this.isSubmitting = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.rewardForm.controls).forEach(key => {
        this.rewardForm.get(key)?.markAsTouched();
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.rewardForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.rewardForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} er påkrævet`;
      if (field.errors['min']) return 'Beløbet skal være mindst 1 DKK';
      if (field.errors['max']) return 'Beløbet må ikke overstige 10.000 DKK';
      if (field.errors['maxlength']) return 'Teksten er for lang';
    }
    return '';
  }

  // Confetti animation setup
  private setupConfettiCanvas(): void {
    const canvas = this.confettiCanvas.nativeElement;
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  }

  private startConfettiAnimation(): void {
    if (!this.confettiCanvas) return;

    const canvas = this.confettiCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const confettiPieces: any[] = [];

    // Create confetti pieces
    for (let i = 0; i < 50; i++) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiPieces.forEach((piece, index) => {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += piece.rotationSpeed;
        piece.vy += 0.1; // gravity

        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rotation * Math.PI / 180);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
        ctx.restore();

        // Remove pieces that are off screen
        if (piece.y > canvas.height + 10) {
          confettiPieces.splice(index, 1);
        }
      });

      if (confettiPieces.length > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  // Get random suggestion for description
  getRandomSuggestion(): void {
    this.updateDescriptionSuggestion();
  }

  // Get reward examples for current type
  getCurrentRewardExamples(): string[] {
    return this.rewardDescriptions[this.selectedRewardType] || [];
  }
}