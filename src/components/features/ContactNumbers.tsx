import { Phone } from 'lucide-react';
import { storage } from '@/lib/storage';

export function ContactNumbers() {
  const contacts = storage.getContactNumbers();
  const primaryContact = contacts.find(c => c.isPrimary);
  const otherContacts = contacts.filter(c => !c.isPrimary);

  if (contacts.length === 0) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Phone className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-primary">Contact Us</h3>
      </div>
      
      <div className="space-y-2">
        {primaryContact && (
          <div className="bg-white p-3 rounded-md border-l-2 border-primary">
            <p className="text-xs text-muted-foreground mb-1">{primaryContact.label}</p>
            <a 
              href={`tel:${primaryContact.number}`}
              className="font-semibold text-primary hover:underline"
            >
              {primaryContact.number}
            </a>
          </div>
        )}
        
        {otherContacts.map(contact => (
          <div key={contact.id} className="bg-white p-2 rounded-md">
            <p className="text-xs text-muted-foreground">{contact.label}</p>
            <a 
              href={`tel:${contact.number}`}
              className="text-sm font-medium hover:text-primary hover:underline"
            >
              {contact.number}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
