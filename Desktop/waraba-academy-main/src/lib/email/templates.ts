/**
 * Email templates — re-exports from React Email components.
 * Each template is authored as a React Email component in /emails/*.tsx
 * and can be previewed with: npm run email:dev
 */

export { welcomeWithCourseTemplate }      from '../../../emails/welcome-course';
export { enrollmentConfirmationTemplate } from '../../../emails/enrollment';
export { passwordResetTemplate }          from '../../../emails/password-reset';
export { newsletterConfirmationTemplate } from '../../../emails/newsletter';
export { contactNotificationTemplate }    from '../../../emails/contact-team';
export { contactConfirmationTemplate }    from '../../../emails/contact-user';
export { certificateObtainedTemplate }    from '../../../emails/certificate';
export { courseCompletedTemplate }        from '../../../emails/course-completed';
export { courseAbandonedTemplate }        from '../../../emails/course-abandoned';
export { courseStartNudgeTemplate }       from '../../../emails/course-start-nudge';
export { paymentFailedTemplate }          from '../../../emails/payment-failed';
export { paymentReminderTemplate }        from '../../../emails/payment-reminder';
export { courseLaunchedTemplate }         from '../../../emails/course-launched';
export { adminNewPaymentTemplate }        from '../../../emails/admin-payment';
export { nextCourseTemplate }             from '../../../emails/next-course';
export { contactNoCourseTemplate }        from '../../../emails/contact-no-course';

// Type re-exports
export type { WelcomeWithCourseEmailProps as WelcomeWithCourseEmailData } from '../../../emails/welcome-course';
export type { EnrollmentEmailProps as EnrollmentEmailData }     from '../../../emails/enrollment';
export type { PasswordResetEmailProps as PasswordResetEmailData } from '../../../emails/password-reset';
export type { NewsletterEmailProps as NewsletterConfirmationData } from '../../../emails/newsletter';
export type { ContactTeamEmailProps as ContactNotificationData } from '../../../emails/contact-team';
export type { ContactUserEmailProps as ContactConfirmationData } from '../../../emails/contact-user';
export type { CertificateEmailProps as CertificateObtainedData } from '../../../emails/certificate';
export type { CourseCompletedEmailProps as CourseCompletedData } from '../../../emails/course-completed';
export type { CourseAbandonedEmailProps as CourseAbandonedData } from '../../../emails/course-abandoned';
export type { PaymentFailedEmailProps as PaymentFailedData }    from '../../../emails/payment-failed';
export type { AdminPaymentEmailProps as AdminNewPaymentData }   from '../../../emails/admin-payment';
export type { NextCourseEmailProps as NextCourseData }          from '../../../emails/next-course';
