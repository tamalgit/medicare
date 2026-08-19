import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

const faqs = [
    {
        question: "Is buying medicines online safe?",
        answer: "Absolutely! All our medicines undergo a three-step quality check process to ensure they are of high quality. We source our products only from licensed retail pharmacies. Medicare is trusted by millions of users across 1000+ cities in India."
    },
    {
        question: "Why choose us for your medicine home delivery?",
        answer: "• Used by 5M+ customers\n• Delivery in 24-48* hours\n• Over 1 Lakh+ Products for you to select from\n• 3-step quality-checked products\n• Scheduled reminders\n• Attractive deals and e-wallet cashbacks\n• Cash on delivery available"
    },
    {
        question: "How do I order medicines from Medicare?",
        answer: "1. Visit our website or open our app.\n2. Search from our list of medicines.\n3. Enter the address where you want your package to be delivered.\n4. Our partner retailer will call you to confirm the order.\n5. The medicine is packed by the pharmacist.\n6. Our delivery person will deliver the package at your doorstep."
    },
    {
        question: "When will Medicare deliver my medicines?",
        answer: "Once you purchase your medicines online with us, you will get it within 24-48* hours. *T&C: The delivery time might vary depending on the delivery location."
    },
    {
        question: "Do I get discounts/cashback while ordering medicines online with Medicare?",
        answer: "Yes, you can get huge discounts and massive e-wallet cashback on purchasing medicines."
    }
];

export const FaqAccordion = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                Frequently Asked Questions
            </h2>
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div 
                        key={index} 
                        className={`bg-white rounded-lg border transition-all duration-200 ${openIndex === index ? 'border-primary-500 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                        <button
                            className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none"
                            onClick={() => toggle(index)}
                        >
                            <span className="font-semibold text-slate-800 flex items-center">
                                <CheckCircle2 className={`w-5 h-5 mr-3 transition-colors ${openIndex === index ? 'text-primary-500' : 'text-slate-300'}`} />
                                {faq.question}
                            </span>
                            {openIndex === index ? (
                                <ChevronUp className="w-5 h-5 text-primary-500 flex-shrink-0" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            )}
                        </button>
                        
                        <div 
                            className={`px-14 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                            <div className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
